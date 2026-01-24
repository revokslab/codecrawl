import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  dts: true,
  platform: 'node',
  target: 'node22',
  tsconfig: 'tsconfig.json',
  noExternal: ['typescript-event-target'],
  esbuildOptions(options) {
    options.define = {
      ...options.define,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }
  },
})
