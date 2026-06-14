/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbkpurgnzxvjzpfdotbk.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
      },
      {
        protocol: "https",
        hostname: "pbkpurgnzxvjzpfdotbk.supabase.co",
        pathname: "/storage/v1/object/public/product-models/**",
      },
    ],
  },
};

module.exports = nextConfig;