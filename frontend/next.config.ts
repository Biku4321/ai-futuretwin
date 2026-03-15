/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // TypeScript errors ko ignore karega build ke waqt
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint errors ko bhi ignore karega build ke waqt
    ignoreDuringBuilds: true,
  },
  // Agar images use kar rahe ho toh unhe optimize karne ke liye
  images: {
    unoptimized: true,
  }
};

export default nextConfig;