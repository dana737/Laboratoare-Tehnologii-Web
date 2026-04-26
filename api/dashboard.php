<?php

declare(strict_types=1);

require __DIR__ . '/common.php';

json_response([
    'success' => true,
    'stats' => [
        'offers' => count(read_jsonl('offers.jsonl')),
        'companies' => count(read_jsonl('companies.jsonl')),
        'issues' => count(read_jsonl('issues.jsonl')),
        'users' => count(read_jsonl('users.jsonl')),
        'logins' => count(read_jsonl('logins.jsonl')),
    ],
    'offers' => read_jsonl('offers.jsonl'),
    'companies' => read_jsonl('companies.jsonl'),
    'issues' => read_jsonl('issues.jsonl'),
    'users' => read_jsonl('users.jsonl'),
    'logins' => read_jsonl('logins.jsonl'),
]);
