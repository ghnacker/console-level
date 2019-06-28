import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

const plugins = [
  typescript(),
  terser({
    output: {
      comments: /^!/
    }
  }),
];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
	      file: 'cjs/index.js',
	      format: 'cjs',
      },
      {
	      file: 'esm/index.js',
	      format: 'esm',
      },
    ],
    plugins
  },
  {
    input: 'src/default.ts',
    output: {
      file: 'umd/index.js',
      format: 'umd',
      name: 'ConsoleLevel'
    },
    plugins
  },
];
