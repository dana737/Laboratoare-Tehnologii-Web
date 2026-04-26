#!/usr/bin/env python3
from lib_cgi import read_form, render_page, run, save_jsonl


def main():
  data = read_form()
  payload = {
    "email": data.get("email"),
    "password_masked": "*" * len(data.get("password", ""))
  }

  save_jsonl("logins.jsonl", payload)

  render_page(
    "Autentificare procesata",
    "Datele au fost primite si inregistrate cu succes.",
    [
      ("Email", payload["email"]),
      ("Parola mascata", payload["password_masked"])
    ],
    "../date-salvate.php",
    "Vezi datele salvate",
    "../HTML/autentificare.html",
    "Inapoi la autentificare"
  )


run(main)
