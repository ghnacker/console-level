import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

// const plugins = [typescript(), terser()];

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
    },
    plugins: [
      typescript({
        compilerOptions: {
          declaration: true,
          declarationDir: 'dist',
        },
      }),
      terser(),
    ],
  },
];
