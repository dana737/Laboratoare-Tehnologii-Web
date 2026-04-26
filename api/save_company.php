<?php

declare(strict_types=1);

require __DIR__ . '/common.php';

$data = normalized_request_data();
$record = append_jsonl('companies.jsonl', [
    'name' => $data['name'] ?? '',
    'phone' => $data['phone'] ?? '',
    'city' => $data['city'] ?? '',
    'email' => $data['email'] ?? '',
    'description' => $data['desc'] ?? '',
    'service1' => $data['service1'] ?? '',
    'price1' => $data['price1'] ?? '',
    'service2' => $data['service2'] ?? '',
    'price2' => $data['price2'] ?? '',
]);

success_response('Profilul firmei a fost salvat prin AJAX.', $record);
