import { i18n } from './next-i18next.config.mjs'

const nextConfig = {
  i18n,
  reactStrictMode: true,
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}

export default nextConfig