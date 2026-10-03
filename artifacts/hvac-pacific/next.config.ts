import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  trailingSlash: false,
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    ...(process.env.REPLIT_DEV_DOMAIN ? [process.env.REPLIT_DEV_DOMAIN] : []),
  ],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);