/* eslint-disable import/no-extraneous-dependencies */
// @ts-ignore
import withLess from 'next-with-less';
import type { NextConfig } from 'next/dist/server/config-shared';

import tw from './tailwind.config';

const nextConfig: NextConfig = {
  experimental: {},
  future: {},
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
