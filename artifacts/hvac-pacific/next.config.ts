import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { REDIRECTS } from "./config/redirects";

const nextConfig:NextConfig={
  trailingSlash:false,
  poweredByHeader:false,
  compress:true,
  images:{
    remotePatterns:[
      {protocol:"https",hostname:"cdn.shopify.com"},
      {protocol:"https",hostname:"*.shopifycdn.com"},
    ],
  },
  allowedDevOrigins:["127.0.0.1","localhost",...(process.env.REPLIT_DEV_DOMAIN?[process.env.REPLIT_DEV_DOMAIN]:[])],
  async redirects(){return REDIRECTS;},
};
const withNextIntl=createNextIntlPlugin();
export default withNextIntl(nextConfig);