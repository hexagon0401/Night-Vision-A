# Bounded worker

run.py executes collector → canonical case → detector → source-linked Trace → CSV ZIP. Default is one cycle. Repeat cycles are explicit (1..100, interval >=60 seconds); imports/installations never start a poller. Source enabled/rights gates and credential requirements remain enforced. Partial acquisitions fail before analysis output rather than claiming full coverage. Persistent state and content-addressed output directories make repeats idempotent.

Offline smoke from the root:

```sh
.venv/bin/python services/worker/run.py --manifest configs/sources/gdelt.json --state-dir .local/worker-state --output-dir .local/worker-results --replay data/fixtures/providers/gdelt.json --acquired-at 2026-01-01T05:00:00Z
```

All replay output remains synthetic. Live mode omits replay/acquired-at and requires an explicitly enabled reviewed manifest. Use --detector-config configs/detection/usgs-alpha.json for the documented magnitude-scale floor. No alerts, external messages, implicit public publication or automatic core DB migrations occur. Retention/storage/provider quotas and real detector calibration need operator review before a long-running production schedule.
