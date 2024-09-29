/* eslint-disable */

const path = require("path");

/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
    };
    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];
    return config;
  },
  headers: () => {
    return [
      ...(process.env.APP_ENV === "local"
        ? [
            {
              source: "/api/:path*",
              headers: [
                { key: "Access-Control-Allow-Credentials", value: "true" },
                {
                  key: "Access-Control-Allow-Origin",
                  value: `http://localhost:${process.env.OPENAPI_PORT ?? 9005}`,
                },
                {
                  key: "Access-Control-Allow-Methods",
                  value: "GET,DELETE,PATCH,POST,PUT",
                },
                {
                  key: "Access-Control-Allow-Headers",
                  value:
                    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                },
              ],
            },
          ]
        : []),
    ];
  },
};
