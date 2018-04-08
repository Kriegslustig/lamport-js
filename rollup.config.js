import babel from 'rollup-plugin-babel'

export default {
  input: 'src/main.js',
  output: [
    {
      file: 'dist/main.js',
      format: 'cjs',
    },
    {
      file: 'dist/main.mjs',
      format: 'es',
    }
  ],
  plugins: [ babel() ],
}
