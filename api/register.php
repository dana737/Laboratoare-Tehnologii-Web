<?php

declare(strict_types=1);

require __DIR__ . '/common.php';

$data = normalized_request_data();
$record = append_jsonl('users.jsonl', [
    'name' => $data['name'] ?? '',
    'email' => $data['email'] ?? '',
    'password_masked' => str_repeat('*', strlen($data['password'] ?? '')),
]);

success_response('Contul nou a fost creat prin AJAX.', $record);
