"""Synthetic checkpoint tests; never call a deployed Worker."""
import pytest
from services.worker.ontology_sync import sync


class SyntheticPublisher:
    def __init__(self, cursors):
        self.cursors = iter(cursors)
        self.requests = []

    def post(self, path, value):
        self.requests.append((path, value))
        return {"next_cursor": next(self.cursors), "counts": {"accepted_count": 2}}


def test_bounded_backfill_preserves_resume_cursor():
    publisher = SyntheticPublisher(["ucdp:2", "ucdp:4"])
    states = []
    result = sync(publisher, "ucdp", max_batches=2, checkpoint=states.append)
    assert result["cursor"] == "ucdp:4" and not result["complete"]
    assert publisher.requests[1][1]["cursor"] == "ucdp:2"
    assert len(states) == 2


def test_end_of_cache_and_nonadvancing_cursor():
    assert sync(SyntheticPublisher([None]), "nearby")["complete"]
    with pytest.raises(ValueError, match="did_not_advance"):
        sync(SyntheticPublisher(["ucdp:2"]), "ucdp", cursor="ucdp:2")


def test_invalid_budget_has_no_network_requests():
    publisher = SyntheticPublisher([])
    with pytest.raises(ValueError, match="invalid_ontology_sync"):
        sync(publisher, "ucdp", max_batches=0)
    assert publisher.requests == []
