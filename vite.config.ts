import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import minifyHTML from 'rollup-plugin-minify-html-literals';
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
    minify: "terser",
    cssMinify: true,
    target: ["edge118", "firefox116", "chrome118", "safari16" ],
    lib: false,
    rollupOptions: {
      output: {
        format: "es",
      },
      plugins: [
        // @ts-ignore
        minifyHTML(),
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
    // basicSsl()
  ]
})
