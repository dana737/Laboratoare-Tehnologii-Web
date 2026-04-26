<?php

declare(strict_types=1);

require __DIR__ . '/common.php';

$data = normalized_request_data();
$record = append_jsonl('offers.jsonl', [
    'company' => $data['company'] ?? 'InstalExpert SRL',
    'category' => $data['category'] ?? '',
    'urgency' => $data['urgency'] ?? '',
    'description' => $data['description'] ?? '',
    'city' => $data['city'] ?? '',
    'phone' => $data['phone'] ?? '',
    'budget' => ($data['budget'] ?? '') !== '' ? $data['budget'] : 'buget flexibil',
]);

success_response('Cererea de oferta a fost trimisa prin AJAX.', $record);
