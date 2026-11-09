from importlib.metadata import version
import subprocess
import sys

def test_installed_distribution_and_cli():
    result = subprocess.run([sys.executable, "-c", "from nv_engine.cli import main; main()", "--version"], capture_output=True, text=True, check=True)
    assert version("nv-engine") == "2.0.0"
    assert result.stdout.strip().endswith("2.0.0")
