# Worker boundary

PR 2 implements bounded one-shot collectors in the engine and CLI, not a running scheduler. No poller, queue, alert or background service is started. A future worker must preserve per-provider quotas, state persistence, source permissions, retention and explicit operational configuration.
