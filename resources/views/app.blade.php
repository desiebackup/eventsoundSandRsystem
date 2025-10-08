<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Sound Scheduling and Reservation System</title>

    {{-- CSRF Token --}}
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Vite React Integration --}}
    @viteReactRefresh
    @vite(['resources/js/App.jsx'])
</head>
<body class="antialiased">
    <div id="app"></div>
</body>
</html>
