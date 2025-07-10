import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/**/*.ts'],
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: false,
    minify: true,
    clean: true,
    external: [
        '@simplewebauthn/browser',
        '@simplewebauthn/server',
    ]
});