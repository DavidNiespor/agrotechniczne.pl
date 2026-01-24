/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! OSTRZEŻENIE !!
    // Pozwala na build nawet jeśli masz błędy TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Pozwala na build nawet jeśli ESLint krzyczy
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig