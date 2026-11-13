"""Manual, bounded ontology backfill from published/cached data; no collection.

Dry-run is the default. Execution requires an enabled, migrated Worker and the
existing publication identity. No secret or signed URL is written to state.
"""
import argparse
import json
import os
from pathlib import Path

from services.worker.monitor import Publisher


def sync(publisher, source, cursor=None, max_batches=25, checkpoint=None):
    if source not in ("ucdp", "nearby") or not 1 <= max_batches <= 100:
        raise ValueError("invalid_ontology_sync_options")
    result = None
    for batch in range(max_batches):
        request = {"source": source, "limit": 2}
        if cursor is not None:
            request["cursor"] = cursor
        result = publisher.post("ontology-sync", request)
        next_cursor = result.get("next_cursor")
        if next_cursor is not None and next_cursor == cursor:
            raise ValueError("ontology_cursor_did_not_advance")
        state = {"source": source, "cursor": next_cursor,
                 "complete": next_cursor is None, "batches": batch + 1,
                 "counts": result.get("counts", {}),
                 "diagnostics": result.get("diagnostics", [])}
        if checkpoint:
            checkpoint(state)
        cursor = next_cursor
        if cursor is None:
            break
    return state


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", choices=("ucdp", "nearby"), default="ucdp")
    parser.add_argument("--max-batches", type=int, default=25)
    parser.add_argument("--state", type=Path)
    parser.add_argument("--execute", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.max_batches <= 100:
        parser.error("--max-batches must be 1..100")
    if not args.execute:
        print(json.dumps({"mode": "dry-run", "source": args.source,
                          "max_batches": args.max_batches,
                          "upstream_collection": False, "network_requests": 0}))
        return
    path = args.state or Path(".local/ontology-sync-" + args.source + ".json")
    saved = json.loads(path.read_text()) if path.exists() else {}
    if saved and saved.get("source") != args.source:
        parser.error("checkpoint source does not match --source")
    cursor = None if saved.get("complete") else saved.get("cursor")
    def checkpoint(state):
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + ".tmp")
        temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2))
        temporary.replace(path)
    publisher = Publisher(os.environ.get("NV_WORKER_ORIGIN", "https://nightvision.hexagon0401.workers.dev"),
                          os.environ.get("NV_INGEST_TOKEN"))
    try:
        print(json.dumps(sync(publisher, args.source, cursor, args.max_batches, checkpoint), ensure_ascii=False))
    except ValueError as error:
        safe = str(error)
        raise SystemExit(safe if safe.startswith(("ontology_", "publication_", "workload_")) else "ontology_sync_failed") from None
    finally:
        publisher.client.close()


if __name__ == "__main__":
    main()
