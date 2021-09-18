/* eslint-disable import/no-extraneous-dependencies */
// @ts-ignore
import withLess from 'next-with-less';
import type { NextConfig } from 'next/dist/server/config-shared';

const nextConfig: NextConfig = {
  experimental: {},
  future: {},
};

export default withLess({
  lessLoaderOptions: {
    lessOptions: {
      modifyVars: {
        'primary-color': '#1F6659',
        'layout-header-background': '#1F6659',
      },
    },
  },
  ...nextConfig,
});
