const Config = require('webpack-chain');

const path = require('path');
const rootDir = process.cwd();

module.exports = async ({ registerTask, registerUserConfig }) => {
  /**
   * 设置默认配置
   */
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

  registerTask('base', buildConfig);

  /**
   * 注册用户配置
   */
  registerUserConfig([
    {
      // entry 配置
      name: 'entry',
      // 配置值校验
      validation: async (value) => {
        return typeof value === 'string';
      },
      // 配置值合并
      configWebpack: async (defaultConfig, value) => {
        defaultConfig.entry('index').clear().add(path.resolve(rootDir, value));
      },
    },
    {
      // outputDir 配置
      name: 'outputDir',
      // 配置值校验
      validation: async (value) => {
        return typeof value === 'string';
      },
      // 配置值合并
      configWebpack: async (defaultConfig, value) => {
        defaultConfig.output.path(path.resolve(rootDir, value));
      },
    },
  ]);
};
