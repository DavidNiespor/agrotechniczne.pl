/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Opcjonalnie: ignorowanie błędów ESLint podczas buildu produkcyjnego (żeby nie blokowało CI/CD)
    eslint: {
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;