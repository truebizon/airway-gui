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
    // private:
    oidcClientSecret: '',
    oidcGrantType: '',
    oidcTokenEndPointDev: '',
    oidcIssuerDev: '',
    dronedbUser: '',
    dronedbPassword: '',
    dronedbHost: '',
    dronedbPort: '',
    dronedbName: '',
    dronedbTableName: '',
    public: {
      mapTileUrl: process.env.NUXT_PUBLIC_MAP_TILE_URL,
      loginApiKey: process.env.NUXT_PUBLIC_LOGIN_API_KEY,
      businessNumber: process.env.NUXT_PUBLIC_BUSINESS_NUMBER,
      centerInitLat: process.env.NUXT_PUBLIC_CENTERINIT_LAT,
      centerInitLon: process.env.NUXT_PUBLIC_CENTERINIT_LON,
      timeoutValueGet: process.env.NUXT_PUBLIC_TIMEOUT_VALUE_GET,
      timeoutValue: process.env.NUXT_PUBLIC_TIMEOUT_VALUE,
      oidcAuthEndPointDev: '',
      oidcRedirectUri: '',
      oidcClientId: '',
      oidcResponseType: '',
      oidcScope: '',
      airwayReservationIgnoreLinkageFailure: '',
      airwayReservationWaittimeBeforeLinkage: '',
      airwayReservationRetryCountBeforeLinkage: '',
      // BaseURL
      apigwApiBaseUrl: '', // API Gateway
      airwayApiBaseUrl: '', // API (航路、最大落下許容範囲)
      safetyApiBaseUrl: '', // API (安全確認)
      reservationApiBaseUrl: '', // API (予約)
      droneApiBaseUrl: '', // API (機体、ドローン)
      miscApiBaseUrl: '', // API (関係者一覧、DIPS連携)
      authApiBaseUrl: '', // API (認証)
      weatherApiBaseUrl: '', // API (風向、風速、降水量)
      weatherApiToken: '', // API (風向、風速、降水量) アクセストークン
      mqttBrokerApiBaseDomain: '', // MQTTブローカー
    },
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
