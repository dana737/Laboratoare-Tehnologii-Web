<?php

declare(strict_types=1);

function run_python_cgi(string $scriptName): void
{
    $scriptPath = __DIR__ . '/' . $scriptName;

    if (!is_file($scriptPath)) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo "Scriptul CGI lipseste: {$scriptName}";
        return;
    }

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $content = file_get_contents('php://input') ?: '';
    $query = $_SERVER['QUERY_STRING'] ?? '';
    $contentLength = strlen($content);

    $env = array_merge($_ENV, [
        'REQUEST_METHOD' => $method,
        'QUERY_STRING' => $query,
        'CONTENT_TYPE' => $_SERVER['CONTENT_TYPE'] ?? 'application/x-www-form-urlencoded',
        'CONTENT_LENGTH' => (string) $contentLength,
        'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'] ?? $scriptName,
        'SCRIPT_FILENAME' => $scriptPath,
    ]);

    $descriptorSpec = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $process = proc_open(
        ['python3', $scriptPath],
        $descriptorSpec,
        $pipes,
        dirname(__DIR__),
        $env
    );

    if (!is_resource($process)) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Nu s-a putut porni procesul CGI.';
        return;
    }

    fwrite($pipes[0], $content);
    fclose($pipes[0]);

    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);

    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[2]);

    $exitCode = proc_close($process);

    if ($exitCode !== 0) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        echo "Eroare CGI:\n\n{$stderr}";
        return;
    }

    [$rawHeaders, $body] = preg_split("/\r?\n\r?\n/", $stdout, 2) + ['', ''];
    $headerLines = preg_split("/\r?\n/", trim($rawHeaders)) ?: [];

    foreach ($headerLines as $line) {
        if ($line === '') {
            continue;
        }

        if (stripos($line, 'Status:') === 0) {
            $status = trim(substr($line, 7));
            $code = (int) strtok($status, ' ');
            if ($code > 0) {
                http_response_code($code);
            }
            continue;
        }

        header($line, true);
    }

    echo $body;
}
