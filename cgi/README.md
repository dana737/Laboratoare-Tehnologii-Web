# LAB4 CGI

Acest folder contine backend-ul pentru formulare.

Scripturile Python raman logica CGI:

- `submit_offer.py`
- `login.py`
- `register.py`
- `save_company.py`
- `report_issue.py`

Scripturile PHP sunt bridge local pentru rulare usoara cu `php -S`:

- `submit_offer.php`
- `login.php`
- `register.php`
- `save_company.php`
- `report_issue.php`

Datele trimise sunt salvate in `../data/*.jsonl`.

## Rulare locala rapida

Din radacina proiectului:

```bash
./LAB4/start-lab4.sh
```

Apoi deschide in browser:

```text
http://127.0.0.1:8000/LAB4/index.html
```

## Apache clasic

- activeaza `cgi` sau `cgi-bin`;
- lasa `.htaccess` din acest folder sa permita `ExecCGI`;
- daca vrei CGI nativ, poti apela scripturile `.py` direct prin Apache.

## Test rapid din terminal

```bash
printf 'email=test@mail.md&password=secret12' | REQUEST_METHOD=POST CONTENT_TYPE='application/x-www-form-urlencoded' CONTENT_LENGTH=35 php login.php
```
