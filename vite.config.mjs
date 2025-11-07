import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/App.jsx'],
            refresh: true,
        }),
        react(),
    ],

    // ✅ Add this block below
    server: {
        host: 'localhost', // ensures consistent hostname
        port: 5173,        // default Vite port
        cors: {
            origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        },
    },
});
