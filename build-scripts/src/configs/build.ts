import * as Config from 'webpack-chain';

const path = require('path');
const rootDir = process.cwd();

const buildConfig = new Config();

buildConfig.entry('index').add('./src/index');

buildConfig.module
  .rule('ts')
  .test(/\.ts?$/)
  .use('ts-loader')
  .loader(require.resolve('ts-loader'));

buildConfig.resolve.extensions.add('.ts').add('.js');

buildConfig.output.filename('main.js');
buildConfig.output.path(path.resolve(rootDir, './dist'));

export default buildConfig;
