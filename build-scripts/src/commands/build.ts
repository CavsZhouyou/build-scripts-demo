import * as webpack from 'webpack';

import ConfigManager from '../core/ConfigManager';

export = async () => {
  // 初始化配置管理类
  const manager = new ConfigManager();

  // webpack 配置初始化
  await manager.setup();

  // 实例化 webpack
  const compiler = webpack(
    manager.configArr.map((config) => config.chainConfig.toConfig())
  );

  // 执行 webpack 编译
  compiler.run((err, stats) => {
    compiler.close((closeErr) => {});
  });
};
