from pathlib import Path
import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, select
from sqlalchemy.exc import OperationalError
from nv_engine.models import CaseBundle
from nv_engine.storage.snapshots import case_snapshots, save_snapshot, load_snapshot


def configuration():
    return Config(str(Path(__file__).resolve().parents[1] / 'alembic.ini'))


def test_migration_roundtrip_snapshot_idempotence_and_integrity(tmp_path, payload):
    engine = create_engine(f'sqlite:///{tmp_path / "case.sqlite3"}')
    config = configuration()
    with engine.begin() as connection:
        config.attributes['connection'] = connection
        command.upgrade(config, 'head')
        assert set(inspect(connection).get_table_names()) == {'case_snapshots', 'alembic_version'}
        bundle = CaseBundle.model_validate(payload)
        revision = save_snapshot(connection, bundle)
        assert save_snapshot(connection, bundle) == revision
        assert load_snapshot(connection, revision) == bundle
        newer = bundle.model_copy(update={'title': 'New synthetic revision'})
        second = save_snapshot(connection, newer)
        assert second != revision
        assert load_snapshot(connection, revision).title == bundle.title
        assert len(connection.execute(select(case_snapshots)).all()) == 2
        connection.execute(case_snapshots.update().where(case_snapshots.c.revision == revision).values(payload=newer.model_dump(mode='json')))
        with pytest.raises(ValueError, match='integrity mismatch'):
            load_snapshot(connection, revision)
        command.downgrade(config, 'base')
        assert 'case_snapshots' not in inspect(connection).get_table_names()
        command.upgrade(config, 'head')
        assert connection.execute(select(case_snapshots)).all() == []
    engine.dispose()


def test_no_implicit_table_creation_and_caller_rollback(tmp_path, payload):
    engine = create_engine(f'sqlite:///{tmp_path / "rollback.sqlite3"}')
    bundle = CaseBundle.model_validate(payload)
    with engine.connect() as connection:
        with pytest.raises(OperationalError):
            save_snapshot(connection, bundle)
        connection.rollback()
        config = configuration()
        config.attributes['connection'] = connection
        command.upgrade(config, 'head')
        connection.commit()
        with pytest.raises(RuntimeError, match='cancel'):
            with connection.begin():
                save_snapshot(connection, bundle)
                raise RuntimeError('cancel transaction')
        assert connection.execute(select(case_snapshots)).all() == []
        with pytest.raises(KeyError):
            load_snapshot(connection, '0' * 64)
    engine.dispose()
