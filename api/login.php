<?php

declare(strict_types=1);

require __DIR__ . '/common.php';

$data = normalized_request_data();
$record = append_jsonl('logins.jsonl', [
    'email' => $data['email'] ?? '',
    'password_masked' => str_repeat('*', strlen($data['password'] ?? '')),
]);

success_response('Autentificarea a fost procesata prin AJAX.', $record);
