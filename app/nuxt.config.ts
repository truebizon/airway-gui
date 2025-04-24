import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  css: [
    './assets/css/main.css',
  ],
  modules: [
    '@nuxt/eslint',
    // 'nuxt-security',
    'nuxt-lodash',
    '@sidebase/nuxt-auth',
    'nuxt-auth-utils',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error vuetify公式のためok
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  eslint: {
    config: {
      stylistic: true,
    },
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  plugins: [
    '~/plugins/user-activity-refresh.js',
  ],
  imports: {
    dirs: [
      // トップレベルモジュールのスキャン
      'composables',
      // ...または、特定の名前とファイル拡張子で１レベル深くネストされたモジュールをスキャン
      'composables/*/*',
    ],
  },
  runtimeConfig: {

  },
  auth: {
    globalAppMiddleware: true,
    provider: {
      type: 'local',
      token: {
        cookieName: 'auth.token',
        signInResponseTokenPointer: '/token',
        maxAgeInSeconds: 43200, // default:1800[s]
      },
    },
  },
})
