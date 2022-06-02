const withLess = require("next-with-less");

/** @type {import('next').NextConfig} */
const nextConfig = {
  future: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = withLess({
  lessLoaderOptions: {
    lessOptions: {
      modifyVars: {
        'primary-color': '#cc2222',
        'layout-header-background': '#cc2222',
      },
    },
  },
  ...nextConfig,
});
