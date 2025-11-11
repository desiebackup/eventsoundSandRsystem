<?php
return [
    // Add reset-password routes so SPA form posts and preflight requests are allowed
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register', 'reset-password', 'reset-password/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];

