/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },
  experimental: {
    serverActions: {},
  },
  async rewrites() {
    return [
      {
        source: "/sign-in",
        destination: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in",
      },
      {
        source: "/sign-up",
        destination: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/sign-in",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/sign-up",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig; 