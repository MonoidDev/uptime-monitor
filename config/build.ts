// eslint-disable-next-line import/no-extraneous-dependencies
import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: [
    './next.config.ts',
    './tailwind.config.ts',
  ].map((p) => require.resolve(p)),
  bundle: false,
  platform: 'node',
  format: 'cjs',
  outdir: '.',
})
  .then(() => console.info('Configs built. '));
