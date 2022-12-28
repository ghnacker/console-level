import ts from 'rollup-plugin-ts';
import terser from '@rollup/plugin-terser';

const terserp = terser({ output: { comments: /^!/ } });
const plugins = [
  ts(),
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
      ts({
        tsconfig: config => ({ ...config, declaration: true }),
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
