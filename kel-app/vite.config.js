import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';
// import cesium from 'vite-plugin-cesium'; // 引入插件
import legacy from '@vitejs/plugin-legacy'; // 兼容性设置
import vueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // cesium(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      eslintrc: {
        enabled: true,
      },
    }),
    // 自动引入
    Components({
      resolvers: [VantResolver()],
    }),
    // 兼容性设置
    legacy({
      targets: ['defaults', 'Chrome >= 56'], //需要兼容的目标列表，可以设置多个
      // additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      // renderLegacyChunks: false,
      // modernPolyfills: [
      //   /* ... */
      //   'es.promise.finally',
      // ],
      modernPolyfills: [
        'es.symbol',
        'es.array.filter',
        'es.promise',
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.for-each',
        'es.object.define-properties',
        'es.object.define-property',
        'es.object.get-own-property-descriptor',
        'es.object.get-own-property-descriptors',
        'es.object.keys',
        'es.object.to-string',
        'web.dom-collections.for-each',
        'esnext.global-this',
        'esnext.string.match-all',
        'es.promise.all-settled',
      ],
      additionalLegacyPolyfills: [
        'core-js/modules/es.promise.finally', // 手动添加 Promise.prototype.finally 的 polyfill
        'regenerator-runtime/runtime', // 手动添加 async/await 的 polyfill
      ],
      // polyfills: [
      //   'es.symbol',
      //   'es.array.filter',
      //   'es.promise',
      //   'es.promise.finally',
      //   // 'es.promise',
      //   'es/map',
      //   'es/set',
      //   'es.array.for-each',
      //   'es.object.define-properties',
      //   'es.object.define-property',
      //   'es.object.get-own-property-descriptor',
      //   'es.object.get-own-property-descriptors',
      //   'es.object.keys',
      //   'es.object.to-string',
      //   'web.dom-collections.for-each',
      //   'esnext.global-this',
      //   'esnext.string.match-all',
      // ],
      // apply: 'build',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      components: fileURLToPath(new URL('./src/components', import.meta.url)),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue', '...'],
  },
  base: './',
  build: {
    outDir: '../www',
    emptyOutDir: true,
    target: ['chrome56'],
  },
  server: {
    open: true,
    proxy: {
      // '/prod-api//safe': {
      //   target: 'http://192.168.31.111:9212',
      //   // target: 'http://172.20.10.8:9212',
      //   rewrite: p => p.replace(/^\/prod-api/, ''),
      // },
      '/prod-api': {
        // target: 'http://60.13.219.226:30808',
        // target: 'http://60.13.219.226:30453',
        // target: 'http://192.168.31.143:8080',
        // target: 'http://192.168.31.19:8080',
        target: 'http://192.168.31.19:8080',
        // target: 'http://111.21.190.118:10039',
        // target: 'https://192.168.0.150:30443/',
        // target: 'http://192.168.31.32:8080',
        changeOrigin: true,
        // secure: false,
        rewrite: p => p.replace(/^\/prod-api/, ''),
      },
      // '/statics': {
      //   target: 'https://60.13.219.226:30443/',
      //   changeOrigin: true,
      //   secure: false
      // }
    },
  },
  optimizeDeps: {
    force: true,
  },
});
