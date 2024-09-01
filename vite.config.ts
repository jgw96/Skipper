import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import minifyHTML from 'rollup-plugin-minify-html-literals';
import strip from '@rollup/plugin-strip';
import removeConsole from "vite-plugin-remove-console";
// import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  worker: {
    format: "es"
  },
  build: {
    sourcemap: false,
    assetsDir: "code",
    minify: "esbuild",
    cssMinify: true,
    target: ["esnext"],
    lib: false,
    rollupOptions: {
      output: {
        format: "es",
      },
      plugins: [
        // @ts-ignore
        strip({
          debugger: true,
          functions: ['console.log', 'assert.*', 'debug', 'alert'],
          labels: ['unittest'],
          sourceMap: true
        })
      ]
    }
  },
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      injectManifest: {
        swSrc: 'public/sw.js',
        swDest: 'dist/sw.js',
        globDirectory: 'dist',
        globPatterns: [
          // glob pattern for index-*.js files
          '**/*.{html,json,svg,css,png,js}'
        ],
      },
      injectRegister: false,
      manifest: false,
      devOptions: {
        enabled: true
      },
    }),
    removeConsole({
      external: [
        'src/services/simplecrypto.ts'
      ]
    })
    // basicSsl()
  ]
})
