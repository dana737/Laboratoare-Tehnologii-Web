#!/usr/bin/env python3
from lib_cgi import read_form, render_page, run, save_jsonl


def main():
  data = read_form()
  payload = {
    "name": data.get("name"),
    "phone": data.get("phone"),
    "city": data.get("city"),
    "email": data.get("email"),
    "description": data.get("desc"),
    "service1": data.get("service1"),
    "price1": data.get("price1"),
    "service2": data.get("service2"),
    "price2": data.get("price2")
  }

  save_jsonl("companies.jsonl", payload)

  render_page(
    "Profilul firmei a fost salvat",
    "Datele firmei au fost salvate cu succes.",
    [
      ("Firma", payload["name"]),
      ("Telefon", payload["phone"]),
      ("Oras", payload["city"]),
      ("Email", payload["email"]),
      ("Serviciu 1", f'{payload["service1"]} - {payload["price1"]}'),
      ("Serviciu 2", f'{payload["service2"]} - {payload["price2"]}'),
      ("Descriere", payload["description"])
    ],
    "../date-salvate.php",
    "Vezi datele salvate",
    "../HTML/adauga-serviciu.html",
    "Editeaza din nou"
  )


run(main)
