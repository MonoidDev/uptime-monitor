/* eslint-disable import/no-extraneous-dependencies */
// @ts-ignore
import withLess from 'next-with-less';
import type { NextConfig } from 'next/dist/server/config-shared';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import tw from './tailwind.config';

const nextConfig: NextConfig = {
  experimental: {},
  future: {},
  webpack(config, options) {
    if (!options.isServer) {
      // eslint-disable-next-line no-param-reassign
      config.plugins = [
        ...config.plugins,
        new BundleAnalyzerPlugin(),
      ];
    }
    return config;
  },
};

export default withLess({
  lessLoaderOptions: {
    lessOptions: {
      modifyVars: {
        'primary-color': tw.theme.extend?.colors?.primary,
        'layout-header-background': tw.theme.extend?.colors?.primary,
      },
    },
  },
  ...nextConfig,
});
