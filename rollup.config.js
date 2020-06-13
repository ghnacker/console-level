import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const terserp = terser({ output: { comments: /^!/ } });
const plugins = [
  typescript(),
  terserp,
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
        declaration: true,
        declarationDir: 'esm',
        rootDir: 'src'
      }),
      terserp,
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
