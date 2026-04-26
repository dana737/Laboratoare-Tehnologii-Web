#!/usr/bin/env python3
from lib_cgi import read_form, render_page, run, save_jsonl


def main():
  data = read_form()
  payload = {
    "company": data.get("company") or "InstalExpert SRL",
    "category": data.get("category"),
    "urgency": data.get("urgency"),
    "description": data.get("description"),
    "city": data.get("city"),
    "phone": data.get("phone"),
    "budget": data.get("budget") or "buget flexibil"
  }

  save_jsonl("offers.jsonl", payload)

  render_page(
    "Cererea de oferta a fost inregistrata",
    "Cererea a fost primita si salvata cu succes.",
    [
      ("Furnizor vizat", payload["company"]),
      ("Categorie", payload["category"]),
      ("Urgenta", payload["urgency"]),
      ("Oras", payload["city"]),
      ("Telefon", payload["phone"]),
      ("Buget", payload["budget"]),
      ("Descriere", payload["description"])
    ],
    "../date-salvate.php",
    "Vezi datele salvate",
    "../HTML/cere-oferta.html",
    "Trimite alta cerere"
  )


run(main)
