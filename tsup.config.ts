import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/**/*.ts'],
    outDir: 'dist',
    format: ['esm'],
    dts: false,
    minify: true,
    clean: true,
    splitting: false,
    external: [
        '@simplewebauthn/browser',
        '@simplewebauthn/server',
    ]
});