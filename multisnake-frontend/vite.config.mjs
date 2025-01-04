import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 80,
        host: '0.0.0.0'
    },

    build: {
        minify: 'terser',
        sourcemap: false,
    },

    plugins: [glsl()]
});
