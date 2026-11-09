"""Reviewable provider policy; credentials are names, never configuration values."""
from typing import Annotated, Literal, Self
from urllib.parse import urlsplit
from pydantic import Field, HttpUrl, model_validator
from nv_engine.models.canonical import Contract, Text


class Rights(Contract):
    statement: Text
    terms_url: HttpUrl
    reviewed: bool = False
    redistribution: Literal['review_required', 'permitted', 'restricted'] = 'review_required'


class Manifest(Contract):
    manifest_schema_version: Literal['1.0.0'] = '1.0.0'
    source_id: Annotated[str, Field(pattern=r'^[a-z0-9][a-z0-9_.:-]{0,31}$')]
    provider: Literal['gdelt', 'ucdp', 'firms', 'rss', 'usgs']
    endpoint: str
    enabled: bool = False
    publisher: Text
    publisher_family: Annotated[str, Field(pattern=r'^[a-z0-9][a-z0-9_.:-]{0,127}$')]
    # Map original domains to registered editorial families, not feed aggregator families.
    publisher_families: dict[str, Annotated[str, Field(pattern=r'^[a-z0-9][a-z0-9_.:-]{0,127}$')]] = Field(default_factory=dict)
    params: dict[str, str] = Field(default_factory=dict)
    rights: Rights
    credential_env: Literal['UCDP_ACCESS_TOKEN', 'FIRMS_MAP_KEY'] | None = None
    ttl_seconds: Annotated[int, Field(ge=0, le=86400)] = 300
    min_interval_seconds: Annotated[float, Field(ge=0.1, le=3600, allow_inf_nan=False)] = 5.0
    timeout_seconds: Annotated[float, Field(ge=1, le=60, allow_inf_nan=False)] = 20.0
    max_attempts: Annotated[int, Field(ge=1, le=4)] = 3
    max_retry_delay_seconds: Annotated[float, Field(ge=1, le=300, allow_inf_nan=False)] = 60.0
    max_bytes: Annotated[int, Field(ge=1024, le=10000000)] = 2000000
    max_records: Annotated[int, Field(ge=1, le=250)] = 100

    @model_validator(mode='after')
    def destination(self) -> Self:
        url = urlsplit(self.endpoint)
        if url.scheme != 'https' or not url.hostname or url.username or url.password or url.query or url.fragment:
            raise ValueError('endpoint must be credential-free HTTPS without query or fragment')
        if url.port not in (None, 443):
            raise ValueError('only standard HTTPS endpoints are supported')
        hosts = {'gdelt': 'api.gdeltproject.org', 'ucdp': 'ucdpapi.pcr.uu.se', 'firms': 'firms.modaps.eosdis.nasa.gov', 'usgs':'earthquake.usgs.gov'}
        if self.provider in hosts and url.hostname != hosts[self.provider]:
            raise ValueError('provider endpoint does not match official host')
        expected = {'ucdp': 'UCDP_ACCESS_TOKEN', 'firms': 'FIRMS_MAP_KEY'}
        if self.credential_env and self.credential_env != expected.get(self.provider):
            raise ValueError('credential binding does not match provider')
        if self.provider == 'firms' and (self.credential_env != 'FIRMS_MAP_KEY' or self.endpoint.count('{credential}') != 1):
            raise ValueError('FIRMS needs its named path credential placeholder')
        if self.provider != 'firms' and '{' in self.endpoint:
            raise ValueError('unexpected URL placeholder')
        if any(k.lower() in {'key', 'map_key', 'token', 'access_token', 'authorization'} for k in self.params):
            raise ValueError('credentials must be bound through credential_env')
        if self.provider == 'gdelt':
            if self.params.get('mode') != 'artlist' or self.params.get('format') != 'json':
                raise ValueError('GDELT supports artlist JSON only')
            if not 1 <= int(self.params.get('maxrecords', '75')) <= 250:
                raise ValueError('GDELT record limit must be between 1 and 250')
        if self.provider == 'ucdp':
            if not 1 <= int(self.params.get('pagesize', '100')) <= 250 or int(self.params.get('page', '1')) < 1:
                raise ValueError('invalid bounded UCDP page request')
        return self
