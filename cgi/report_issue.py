#!/usr/bin/env python3
from lib_cgi import read_form, render_page, run, save_jsonl


def main():
  data = read_form()
  payload = {
    "title": data.get("title"),
    "city": data.get("city"),
    "category": data.get("category"),
    "description": data.get("description")
  }

  save_jsonl("issues.jsonl", payload)

  render_page(
    "Sesizarea a fost trimisa",
    "Sesizarea a fost primita si adaugata in lista de inregistrari.",
    [
      ("Titlu", payload["title"]),
      ("Oras", payload["city"]),
      ("Categorie", payload["category"]),
      ("Descriere", payload["description"])
    ],
    "../date-salvate.php",
    "Vezi datele salvate",
    "../HTML/probleme-locale.html",
    "Revino la probleme"
  )


run(main)
