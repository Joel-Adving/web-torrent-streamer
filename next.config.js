/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  api: {
    responseLimit: false
  },
  output: 'standalone'
}

module.exports = nextConfig
