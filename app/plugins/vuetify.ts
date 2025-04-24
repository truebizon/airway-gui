// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VCalendar } from 'vuetify/labs/VCalendar'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    // ... your configuration
    ssr: true,
    defaults: {
      VCheckbox: {
        VLabel: {
          class: 'font-weight-black',
          style: {
            opacity: 1.0,
          },
          components: {
            VCalendar,
          },
        },
      },
    },
  })
  app.vueApp.use(vuetify)
})
