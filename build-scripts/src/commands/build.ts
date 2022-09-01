import * as path from 'path';
import * as webpack from 'webpack';

import defaultConfig from '../configs/build';
import ConfigManager from '../core/ConfigManager';

export = async () => {
  const rootDir = process.cwd();

  // 获取用户配置
  let userConfig: { [name: string]: any } = {};
  try {
    userConfig = require(path.resolve(rootDir, './build.json'));
  } catch (error) {
    console.log('Config error: build.json is not exist.');
    return;
  }

  // 初始化配置管理类
  const manager = new ConfigManager(defaultConfig, userConfig);

  // 注册用户配置
  manager.registerUserConfig([
    {
      // entry 配置
      name: 'entry',
      // 配置值校验
      validation: async (value) => {
        return typeof value === 'string';
      },
      // 配置值合并
      configWebpack: async (defaultConfig, value) => {
        defaultConfig.entry = path.resolve(rootDir, value);
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
        defaultConfig.output.path = path.resolve(rootDir, value);
      },
    },
  ]);

  // webpack 配置初始化
  await manager.setup();

  // 实例化 webpack
  const compiler = webpack(manager.config);

  // 执行 webpack 编译
  compiler.run((err, stats) => {
    compiler.close((closeErr) => {});
  });
};
