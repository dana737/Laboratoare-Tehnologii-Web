#!/usr/bin/env python3
from lib_cgi import read_form, render_page, run, save_jsonl


def main():
  data = read_form()
  payload = {
    "name": data.get("name"),
    "email": data.get("email"),
    "password_masked": "*" * len(data.get("password", ""))
  }

  save_jsonl("users.jsonl", payload)

  render_page(
    "Contul nou a fost creat",
    "Contul a fost inregistrat cu succes.",
    [
      ("Nume", payload["name"]),
      ("Email", payload["email"]),
      ("Parola mascata", payload["password_masked"])
    ],
    "../date-salvate.php",
    "Vezi datele salvate",
    "../HTML/autentificare.html",
    "Creeaza alt cont"
  )


run(main)
