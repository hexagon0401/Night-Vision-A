"""Verify the exact pre-NV2 inventory; no historical content is rewritten."""
import csv
import hashlib
from pathlib import Path
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
BASE = '19e6b81a4ce228f3ce9318ef60e668781981b274'

def verify():
    with (ROOT / 'docs/migration/manifest.csv').open(newline='') as stream:
        rows = list(csv.DictReader(stream))
    original = set(subprocess.check_output(['git', 'ls-tree', '-rz', '--name-only', BASE], cwd=ROOT).decode().strip('\0').split('\0'))
    assert {row['old_path'] for row in rows} == original, 'Missing or additional baseline paths'
    assert len(rows) == len(original) == len({row['new_path'] for row in rows})
    archives = 0
    for row in rows:
        old_bytes = subprocess.check_output(['git', 'show', f"{BASE}:{row['old_path']}"], cwd=ROOT)
        digest = hashlib.sha256(old_bytes).hexdigest()
        path = ROOT / row['new_path']
        assert digest == row['sha256'], f"Invalid baseline digest: {row['old_path']}"
        assert hashlib.sha256(path.read_bytes()).hexdigest() == digest, f'Changed: {path}'
        if path.suffix in ('.zip', '.skill'):
            with zipfile.ZipFile(path) as archive:
                assert archive.testzip() is None, f'Corrupt archive: {path}'
                archives += 1
    print(f'PASS: {len(rows)} original files preserved byte-for-byte; {archives} historical archives intact.')

if __name__ == '__main__':
    verify()
