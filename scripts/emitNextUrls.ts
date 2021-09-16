/* eslint-disable import/no-extraneous-dependencies */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

import { debounce } from 'debounce';
import { NextConfig } from 'next';
import { createPagesMapping } from 'next/dist/build/entries';
import { collectPages } from 'next/dist/build/utils';
import { findPagesDir } from 'next/dist/lib/find-pages-dir';
import loadConfig from 'next/dist/server/config';
import prettier from 'prettier';

export interface EmitNextUrlsConfig {
  dir?: string;
  output?: string;
  watch?: boolean;
}

export const main = async (config: EmitNextUrlsConfig = {}) => {
  const {
    dir = '.',
    output = '.next-urls.ts',
    watch = false,
  } = config;

  if (!output.endsWith('.ts')) {
    throw new Error('Cannot output to a non-typescript file');
  }

  const nextConfig: NextConfig = await loadConfig(
    'phase-production-build',
    dir,
  );

  const pagesDir = findPagesDir(dir);

  const emit = async () => {
    const pagePaths = await collectPages(pagesDir, nextConfig.pageExtensions!);

    const mappedPages = createPagesMapping(
      pagePaths, nextConfig.pageExtensions!, true, false,
    );

    const urls = Object.keys(mappedPages).filter(
      (s) => !s.match(/^\/(_|api)/),
    );

    const code = `
      export type Urls = ${urls.map((x) => JSON.stringify(x)).join('|')};
      export const url = (x: Urls) => x;
    `;

    if (!existsSync(dirname(output))) {
      mkdirSync(dirname(output));
    }

    writeFileSync(output, prettier.format(code, { parser: 'babel' }));
  };

  if (watch) {
    const chokidar = await import('chokidar');
    const handleChange = async () => {
      await emit();
      console.info(`${output} is generated. `);
    };
    chokidar
      .watch(pagesDir)
      .on('all', debounce(handleChange, 500));
  } else {
    await emit();
  }
};

main({
  watch: process.argv.includes('watch'),
});

export {};
