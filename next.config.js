/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')

// const nextConfig = {
//   i18n,
//   reactStrictMode: false,
// };

// module.exports = nextConfig

module.exports = {
  i18n: i18n,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/auth',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/admin/tags',
        permanent: true,
      },
    ]
  }
}
