#!/usr/bin/env python3
import html
import json
import os
import sys
import traceback
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def ensure_data_dir():
  DATA_DIR.mkdir(parents=True, exist_ok=True)


def read_form():
  method = os.environ.get("REQUEST_METHOD", "GET").upper()
  raw_payload = ""

  if method == "POST":
    try:
      length = int(os.environ.get("CONTENT_LENGTH", "0"))
    except ValueError:
      length = 0

    raw_payload = sys.stdin.read(length) if length > 0 else ""
  else:
    raw_payload = os.environ.get("QUERY_STRING", "")

  parsed = parse_qs(raw_payload, keep_blank_values=True)
  return {key: values[0].strip() for key, values in parsed.items()}


def save_jsonl(filename, payload):
  ensure_data_dir()
  target = DATA_DIR / filename
  enriched = {
    "submitted_at": datetime.now().isoformat(timespec="seconds"),
    **payload
  }

  with target.open("a", encoding="utf-8") as stream:
    stream.write(json.dumps(enriched, ensure_ascii=False) + "\n")


def h(text):
  return html.escape(str(text), quote=True)


def render_page(title, intro, rows, primary_href, primary_label, secondary_href, secondary_label):
  items = "\n".join(
    f"<li><strong>{h(label)}:</strong> {h(value)}</li>"
    for label, value in rows
    if value
  )

  print("Content-Type: text/html; charset=utf-8")
  print()
  print(f"""<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{h(title)}</title>
  <style>
    :root {{
      --bg: #f4efe7;
      --card: #fffaf4;
      --ink: #1d2a33;
      --muted: #667784;
      --accent: #cc5a2b;
      --line: #e8d8c3;
      --ok: #276749;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: Manrope, Arial, sans-serif;
      background: linear-gradient(135deg, #f9f3eb, #eef4f2);
      color: var(--ink);
    }}
    main {{
      width: min(760px, calc(100% - 32px));
      margin: 48px auto;
      padding: 32px;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 24px;
      box-shadow: 0 24px 60px rgba(38, 51, 63, 0.12);
    }}
    .badge {{
      display: inline-block;
      margin-bottom: 14px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(39, 103, 73, 0.12);
      color: var(--ok);
      font-weight: 700;
      letter-spacing: 0.02em;
    }}
    h1 {{ margin: 0 0 10px; font-size: clamp(28px, 5vw, 42px); }}
    p {{ color: var(--muted); line-height: 1.6; }}
    ul {{
      margin: 24px 0 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 12px;
    }}
    li {{
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px solid var(--line);
      background: #fff;
    }}
    .actions {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 28px;
    }}
    a {{
      text-decoration: none;
      padding: 12px 16px;
      border-radius: 999px;
      font-weight: 700;
    }}
    .primary {{ background: var(--accent); color: #fff; }}
    .secondary {{ background: transparent; color: var(--ink); border: 1px solid var(--line); }}
  </style>
</head>
<body>
  <main>
    <div class="badge">Succes</div>
    <h1>{h(title)}</h1>
    <p>{h(intro)}</p>
    <ul>{items}</ul>
    <div class="actions">
      <a class="primary" href="{h(primary_href)}">{h(primary_label)}</a>
      <a class="secondary" href="{h(secondary_href)}">{h(secondary_label)}</a>
    </div>
  </main>
</body>
</html>""")


def render_error_page(title):
  print("Status: 500 Internal Server Error")
  print("Content-Type: text/html; charset=utf-8")
  print()
  print(f"""<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{h(title)}</title>
</head>
<body style="font-family:Arial,sans-serif;padding:24px;">
  <h1>{h(title)}</h1>
  <pre style="white-space:pre-wrap;background:#f6f6f6;padding:16px;border-radius:12px;">{h(traceback.format_exc())}</pre>
</body>
</html>""")


def run(handler):
  try:
    handler()
  except Exception:
    render_error_page("Eroare la procesarea CGI")
