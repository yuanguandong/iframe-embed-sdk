import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  globalName: 'IframeEmbedSDK',
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
});
