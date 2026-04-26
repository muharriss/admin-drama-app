// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ui: {
    colorMode: false,
  },
  ssr: false,
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://belajarbaca.xyz/admin/backend',
      apiKey: process.env.NUXT_PUBLIC_API_KEY || 'XuioakMhgre156Hbxjutavnsjuy',
    },
  },
  routeRules: {
    "/api/**": {
      proxy: process.env.API_PROXY + "/**",
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  }
})
