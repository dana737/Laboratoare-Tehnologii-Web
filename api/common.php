<?php

declare(strict_types=1);

date_default_timezone_set('Europe/Chisinau');

function ensure_data_dir(): string
{
    $path = dirname(__DIR__) . '/data';
    if (!is_dir($path)) {
        mkdir($path, 0777, true);
    }

    return $path;
}

function normalized_request_data(): array
{
    if ($_POST !== []) {
        return normalize_array($_POST);
    }

    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        $raw = file_get_contents('php://stdin') ?: '';
    }
    if ($raw === '') {
        return [];
    }

    parse_str($raw, $parsed);
    return normalize_array($parsed);
}

function normalize_array(array $input): array
{
    $normalized = [];

    foreach ($input as $key => $value) {
        $normalized[(string) $key] = is_array($value)
            ? trim((string) reset($value))
            : trim((string) $value);
    }

    return $normalized;
}

function append_jsonl(string $filename, array $payload): array
{
    $record = [
        'submitted_at' => date('c'),
        ...$payload,
    ];

    $target = ensure_data_dir() . '/' . $filename;
    file_put_contents(
        $target,
        json_encode($record, JSON_UNESCAPED_UNICODE) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );

    return $record;
}

function read_jsonl(string $filename): array
{
    $target = ensure_data_dir() . '/' . $filename;
    if (!is_file($target)) {
        return [];
    }

    $rows = [];
    $lines = file($target, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];

    foreach ($lines as $line) {
        $decoded = json_decode($line, true);
        if (is_array($decoded)) {
            $rows[] = $decoded;
        }
    }

    return array_reverse($rows);
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function success_response(string $message, array $record): void
{
    json_response([
        'success' => true,
        'message' => $message,
        'record' => $record,
        'dashboard_url' => '../date-salvate.html',
    ]);
}
