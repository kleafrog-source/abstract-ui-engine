from __future__ import annotations

import os
import shutil
import socket
import subprocess
import sys
from pathlib import Path

from backend import create_app
from backend.config import FLASK_HOST, FLASK_PORT, NEXT_PORT

ROOT_DIR = Path(__file__).resolve().parent
REPLACE_FRONTEND_ON_PORT = os.getenv("REPLACE_FRONTEND_ON_PORT", "1") == "1"
RESET_NEXT_DEV_CACHE = os.getenv("RESET_NEXT_DEV_CACHE", "1") == "1"


def ensure_embeddings() -> None:
    subprocess.run(
        [sys.executable, "scripts/build_lexicon_embeddings.py"],
        cwd=ROOT_DIR,
        check=True,
    )


def resolve_npm_executable() -> str | None:
    for candidate in ("npm.cmd", "npm.exe", "npm"):
        resolved = shutil.which(candidate)
        if resolved:
            return resolved
    return None


def is_port_in_use(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex((host, port)) == 0


def pids_listening_on_port(port: int) -> list[int]:
    result = subprocess.run(
        ["netstat", "-ano", "-p", "tcp"],
        capture_output=True,
        text=True,
        check=True,
    )
    pids: set[int] = set()
    suffix = f":{port}"
    for line in result.stdout.splitlines():
        parts = line.split()
        if len(parts) < 5 or parts[0] != "TCP":
            continue
        local_address = parts[1]
        state = parts[3]
        pid_text = parts[4]
        if not local_address.endswith(suffix):
            continue
        if state.upper() != "LISTENING":
            continue
        try:
            pids.add(int(pid_text))
        except ValueError:
            continue
    return sorted(pids)


def stop_processes_on_port(port: int) -> None:
    pids = pids_listening_on_port(port)
    if not pids:
        return
    for pid in pids:
        print(f"[run_app] stopping existing process on port {port}: pid={pid}")
        subprocess.run(
            ["taskkill", "/PID", str(pid), "/T", "/F"],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def clear_next_dev_cache() -> None:
    if not RESET_NEXT_DEV_CACHE:
        return
    next_dev_cache = ROOT_DIR / ".next" / "dev" / "cache"
    if not next_dev_cache.exists():
        return
    print(f"[run_app] clearing Next.js dev cache: {next_dev_cache}")
    shutil.rmtree(next_dev_cache, ignore_errors=True)


def start_frontend() -> subprocess.Popen[str] | None:
    if os.getenv("START_FRONTEND", "1") != "1":
        return None
    if not (ROOT_DIR / "package.json").exists():
        return None
    if is_port_in_use("127.0.0.1", NEXT_PORT):
        if REPLACE_FRONTEND_ON_PORT:
            stop_processes_on_port(NEXT_PORT)
        if is_port_in_use("127.0.0.1", NEXT_PORT):
            print(
                f"[run_app] frontend port {NEXT_PORT} is already in use; "
                "assuming Next.js is already running."
            )
            return None
    npm_executable = resolve_npm_executable()
    if not npm_executable:
        print("[run_app] npm executable not found; starting Flask without frontend dev server.")
        return None
    clear_next_dev_cache()
    return subprocess.Popen(
        [npm_executable, "run", "dev"],
        cwd=ROOT_DIR,
        stdout=sys.stdout,
        stderr=sys.stderr,
        text=True,
    )


def main() -> None:
    ensure_embeddings()
    frontend = start_frontend()
    try:
        app = create_app()
        app.run(host=FLASK_HOST, port=FLASK_PORT, debug=False, use_reloader=False)
    finally:
        if frontend and frontend.poll() is None:
            frontend.terminate()
            try:
                frontend.wait(timeout=10)
            except subprocess.TimeoutExpired:
                frontend.kill()


if __name__ == "__main__":
    main()
