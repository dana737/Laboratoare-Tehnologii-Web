<?php

declare(strict_types=1);

function readJsonLines(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $rows = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];

    foreach ($lines as $line) {
        $decoded = json_decode($line, true);
        if (is_array($decoded)) {
            $rows[] = $decoded;
        }
    }

    return array_reverse($rows);
}

function escape(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function renderItems(array $items, callable $renderer): string
{
    if ($items === []) {
        return '<div class="list-item"><div class="item-title">Nu exista inregistrari inca.</div><div class="item-meta">Trimite un formular ca sa apara date aici.</div></div>';
    }

    $html = '';
    foreach ($items as $item) {
        $html .= $renderer($item);
    }

    return $html;
}

$dataDir = __DIR__ . '/data';
$offers = readJsonLines($dataDir . '/offers.jsonl');
$users = readJsonLines($dataDir . '/users.jsonl');
$companies = readJsonLines($dataDir . '/companies.jsonl');
$issues = readJsonLines($dataDir . '/issues.jsonl');
$logins = readJsonLines($dataDir . '/logins.jsonl');
?>
<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Servicii Moldova - Date salvate</title>
  <link rel="icon" type="image/svg+xml" href="image/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="CSS/styles.css">
</head>
<body>
  <header class="top">
    <div class="container">
      <div class="header-row">
        <a class="brand" href="index.html">
          <div class="brand-logo">SM</div>
          <div>
            <div class="brand-title">Servicii Moldova</div>
            <div class="brand-sub">Panou cu date salvate din formulare</div>
          </div>
        </a>
        <nav class="nav-actions">
          <a class="tab" href="index.html">Harta</a>
          <a class="tab" href="HTML/cere-oferta.html">Cere oferta</a>
          <a class="tab" href="HTML/probleme-locale.html">Probleme</a>
          <a class="tab" href="HTML/autentificare.html">Autentificare</a>
          <a class="tab primary active" href="date-salvate.php">Date salvate</a>
        </nav>
      </div>

      <div class="stats-row">
        <span class="badge"><?php echo count($offers); ?> cereri oferta</span>
        <span class="badge"><?php echo count($companies); ?> profile firma</span>
        <span class="badge"><?php echo count($issues); ?> sesizari</span>
        <span class="badge"><?php echo count($users); ?> conturi noi</span>
        <span class="badge"><?php echo count($logins); ?> login-uri</span>
      </div>
    </div>
  </header>

  <main class="page">
    <section class="hero-clean" style="margin-bottom:.9rem;">
      <div class="hero-row">
        <div>
          <h1>Datele trimise prin formulare sunt afisate direct in site.</h1>
          <p class="hero-mini">Aceasta varianta transforma fisierele salvate de backend in continut vizibil pentru utilizator si pentru prezentare.</p>
        </div>
        <div class="stack-cards" style="min-width:280px;">
          <div class="c"><strong>Surse</strong><p>`offers`, `users`, `companies`, `issues`, `logins`.</p></div>
          <div class="c"><strong>Format</strong><p>Citire din fisiere `.jsonl` generate dupa submit.</p></div>
          <div class="c"><strong>Scop</strong><p>Datele nu se mai pierd in backend, ci se si vad.</p></div>
        </div>
      </div>
    </section>

    <div class="grid-2" style="grid-template-columns:1fr 1fr;">
      <section class="card">
        <div class="card-head"><h2>Cereri de oferta</h2><span class="badge"><?php echo count($offers); ?></span></div>
        <div class="card-body list">
          <?php echo renderItems($offers, static function (array $item): string {
              $company = escape($item['company'] ?? 'Furnizor necunoscut');
              $category = escape($item['category'] ?? '');
              $city = escape($item['city'] ?? '');
              $budget = escape($item['budget'] ?? '');
              $description = escape($item['description'] ?? '');
              $time = escape($item['submitted_at'] ?? '');

              return "<article class=\"list-item\"><div class=\"item-top\"><span class=\"item-title\">{$company}</span><span class=\"badge\">{$category}</span></div><div class=\"item-meta\">{$city} · {$budget} · {$time}</div><p class=\"muted\" style=\"margin-top:.45rem;\">{$description}</p></article>";
          }); ?>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2>Profile firma</h2><span class="badge"><?php echo count($companies); ?></span></div>
        <div class="card-body list">
          <?php echo renderItems($companies, static function (array $item): string {
              $name = escape($item['name'] ?? 'Firma fara nume');
              $city = escape($item['city'] ?? '');
              $phone = escape($item['phone'] ?? '');
              $service1 = escape($item['service1'] ?? '');
              $price1 = escape($item['price1'] ?? '');
              $time = escape($item['submitted_at'] ?? '');

              return "<article class=\"list-item\"><div class=\"item-top\"><span class=\"item-title\">{$name}</span><span class=\"badge\">{$city}</span></div><div class=\"item-meta\">{$phone} · {$time}</div><p class=\"muted\" style=\"margin-top:.45rem;\">Serviciu principal: {$service1} {$price1}</p></article>";
          }); ?>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2>Sesizari locale</h2><span class="badge"><?php echo count($issues); ?></span></div>
        <div class="card-body list">
          <?php echo renderItems($issues, static function (array $item): string {
              $title = escape($item['title'] ?? 'Sesizare');
              $city = escape($item['city'] ?? '');
              $category = escape($item['category'] ?? '');
              $description = escape($item['description'] ?? '');
              $time = escape($item['submitted_at'] ?? '');

              return "<article class=\"list-item\"><div class=\"item-top\"><span class=\"item-title\">{$title}</span><span class=\"badge\">{$category}</span></div><div class=\"item-meta\">{$city} · {$time}</div><p class=\"muted\" style=\"margin-top:.45rem;\">{$description}</p></article>";
          }); ?>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2>Conturi noi</h2><span class="badge"><?php echo count($users); ?></span></div>
        <div class="card-body list">
          <?php echo renderItems($users, static function (array $item): string {
              $name = escape($item['name'] ?? 'Utilizator');
              $email = escape($item['email'] ?? '');
              $time = escape($item['submitted_at'] ?? '');

              return "<article class=\"list-item\"><div class=\"item-top\"><span class=\"item-title\">{$name}</span><span class=\"badge\">user</span></div><div class=\"item-meta\">{$email} · {$time}</div></article>";
          }); ?>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2>Autentificari recente</h2><span class="badge"><?php echo count($logins); ?></span></div>
        <div class="card-body list">
          <?php echo renderItems($logins, static function (array $item): string {
              $email = escape($item['email'] ?? '');
              $time = escape($item['submitted_at'] ?? '');

              return "<article class=\"list-item\"><div class=\"item-top\"><span class=\"item-title\">Autentificare</span><span class=\"badge\">login</span></div><div class=\"item-meta\">{$email} · {$time}</div></article>";
          }); ?>
        </div>
      </section>
    </div>
  </main>
</body>
</html>
