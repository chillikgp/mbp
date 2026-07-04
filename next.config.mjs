/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/privacy-policy.html",
        destination: "/privacy-policy/",
        permanent: true,
      },
      {
        source: "/testimonials.html",
        destination: "/testimonials/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
