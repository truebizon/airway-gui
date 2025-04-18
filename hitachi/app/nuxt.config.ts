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
  imports: {
    dirs: [
      // トップレベルモジュールのスキャン
      'composables',
      // ...または、特定の名前とファイル拡張子で１レベル深くネストされたモジュールをスキャン
      'composables/*/*',
    ],
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: '',
      baseCenterLat: process.env.NUXT_PUBLIC_BASE_CENTER_LAT,
      baseCenterLon: process.env.NUXT_PUBLIC_BASE_CENTER_LON,
      baseZoom: process.env.NUXT_PUBLIC_BASE_ZOOM,
      mapMinZoom: process.env.NUXT_PUBLIC_MAP_MIN_ZOOM,
      mapMaxZoom: process.env.NUXT_PUBLIC_MAP_MAX_ZOOM,
      maxBoundSouth: process.env.NUXT_PUBLIC_MAX_BOUND_SOUTH,
      maxBoundWest: process.env.NUXT_PUBLIC_MAX_BOUND_WEST,
      maxBoundEast: process.env.NUXT_PUBLIC_MAX_BOUND_EAST,
      maxBoundNorth: process.env.NUXT_PUBLIC_MAX_BOUND_NORTH,
      mapTileUrl: process.env.NUXT_PUBLIC_MAP_TILE_URL,
      emergencyIconColor: process.env.NUXT_PUBLIC_EMERGENCY_ICON_COLOR,
      dronePortIconColor: process.env.NUXT_PUBLIC_DRONE_PORT_ICON_COLOR,
      notAvailablePortIconColor: process.env.NUXT_PUBLIC_NOT_AVAILABLE_PORT_ICON_COLOR,
      preparationPortIconColor: process.env.NUXT_PUBLIC_PREPARATION_PORT_ICON_COLOR,
      maintenancePortIconColor: process.env.NUXT_PUBLIC_MAINTENANCE_PORT_ICON_COLOR,
      largePortIconSize: process.env.NUXT_PUBLIC_LARGE_PORT_ICON_SIZE,
      zoomThresholdLM: process.env.NUXT_PUBLIC_ZOOM_THRESHOLD_LM,
      mediumPortIconSize: process.env.NUXT_PUBLIC_MEDIUM_PORT_ICON_SIZE,
      zoomThresholdMS: process.env.NUXT_PUBLIC_ZOOM_THRESHOLD_MS,
      smallPortIconSize: process.env.NUXT_PUBLIC_SMALL_PORT_ICON_SIZE,
      apiKey: process.env.NUXT_PUBLIC_API_KEY,
    },
  },
})
