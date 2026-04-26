<?php

declare(strict_types=1);

require __DIR__ . '/common.php';

$data = normalized_request_data();
$record = append_jsonl('issues.jsonl', [
    'title' => $data['title'] ?? '',
    'city' => $data['city'] ?? '',
    'category' => $data['category'] ?? '',
    'description' => $data['description'] ?? '',
]);

success_response('Sesizarea a fost trimisa prin AJAX.', $record);
