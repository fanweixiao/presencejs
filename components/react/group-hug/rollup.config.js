import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import jsx from 'acorn-jsx';
import replace from '@rollup/plugin-replace';

/** @type {import('rollup').RollupOptions} */
module.exports = [
  {
    input: './index.tsx',
    output: {
      file: './dist/index.esm.js',
      format: 'esm',
      sourceMap: true,
    },
    acornInjectPlugins: [jsx()],
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      typescript({
        include: ['*'],
        compilerOptions: {
          jsx: 'preserve',
        },
      }),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-react'],
        extensions: ['.tsx'],
      }),
    ],
    external: ['react'],
  },
  {
    input: './index.tsx',
    output: {
      name: 'group-hug',
      file: './dist/index.umd.js',
      format: 'umd',
      sourceMap: true,
    },
    acornInjectPlugins: [jsx()],
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      typescript({
        include: ['*'],
        compilerOptions: {
          jsx: 'preserve',
        },
      }),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-react'],
        extensions: ['.tsx'],
      }),
    ],
    external: ['react'],
  },
];
