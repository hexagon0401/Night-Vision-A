# Evidence interactions

Current contextual evidence/tool rendering is in app/shell.ts. Source, layer and candidate tools are mutually exclusive; evidence pinning is user controlled. Escape dismisses panels. Provider content is inserted as DOM text, and source URL schemes/credentials are checked. Larger reusable overlay components can be extracted here as Trace is added.
