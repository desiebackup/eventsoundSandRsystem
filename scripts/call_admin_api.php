<?php
if ($argc < 2) {
    fwrite(STDERR, "Usage: php call_admin_api.php <token> [url]\n");
    exit(2);
}
$token = $argv[1];
$url = $argv[2] ?? 'http://127.0.0.1:8000/api/admin/users';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer ' . $token,
]);

$response = curl_exec($ch);
$info = curl_getinfo($ch);
$err = curl_error($ch);
curl_close($ch);

$out = [
    'http_code' => $info['http_code'] ?? null,
    'response' => $response,
    'error' => $err ?: null,
];

echo json_encode($out, JSON_PRETTY_PRINT) . PHP_EOL;
