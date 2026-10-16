"""Serve the portfolio over HTTP so YouTube receives a valid Referer."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser

if __name__ == "__main__":
    handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).parent))
    with ThreadingHTTPServer(("127.0.0.1", 0), handler) as server:
        url = f"http://127.0.0.1:{server.server_port}/#shmackle"
        print(url, flush=True)
        webbrowser.open(url)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
