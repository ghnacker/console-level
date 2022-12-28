import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const plugins = [
  typescript(),
  terser(),
];

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'esm',
      format: 'esm',
    },
    plugins: [
      typescript({
        compilerOptions: {
          declaration: true,
          declarationDir: 'esm',
        },
      }),
      terser(),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'cjs/index.js',
      format: 'cjs',
    },
    plugins,
  },
  {
    input: 'src/default.js',
    output: {
      file: 'umd/index.js',
      format: 'umd',
      name: 'ConsoleLevel'
    },
    plugins,
  },
];
