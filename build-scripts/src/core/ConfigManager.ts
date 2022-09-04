import _ = require('lodash');
import path = require('path');
import assert = require('assert');
import WebpackChain = require('webpack-chain');

// 配置类型定义
interface IConfig {
  [key: string]: any;
}

// 用户配置注册信息类型定义
interface IUserConfigRegistration {
  [key: string]: IUserConfigArgs;
}
interface IUserConfigArgs {
  name: string;
  defaultValue?: any;
  validation?: (value: any) => Promise<boolean>;
  configWebpack?: (defaultConfig: WebpackChain, value: any) => void;
}

class ConfigManager {
  // webpack 配置
  public config: WebpackChain;
  // 用户配置
  public userConfig: IConfig;
  // 用户配置注册信息
  private userConfigRegistration: IUserConfigRegistration;

  constructor(config: WebpackChain) {
    this.config = config;
    this.userConfig = {};
    this.userConfigRegistration = {};
  }

  /**
   * 注册用户配置
   *
   * @param {IUserConfigArgs[]} configs
   * @memberof ConfigManager
   */
  public registerUserConfig(configs: IUserConfigArgs[]) {
    configs.forEach((conf) => {
      const configName = conf.name;

      // 判断配置属性是否已注册
      if (this.userConfigRegistration[configName]) {
        throw new Error(
          `[Config File]: ${configName} already registered in userConfigRegistration.`
        );
      }

      // 添加配置的注册信息
      this.userConfigRegistration[configName] = conf;

      // 如果当前项目的用户配置中不存在该配置值，则使用该配置注册时的默认值
      if (
        _.isUndefined(this.userConfig[configName]) &&
        Object.prototype.hasOwnProperty.call(conf, 'defaultValue')
      ) {
        this.userConfig[configName] = conf.defaultValue;
      }
    });
  }

  /**
   * 获取用户配置
   *
   * @private
   * @return {*}
   * @memberof ConfigManager
   */
  private getUserConfig() {
    const rootDir = process.cwd();
    try {
      this.userConfig = require(path.resolve(rootDir, './build.json'));
    } catch (error) {
      console.log('Config error: build.json is not exist.');
      return;
    }
  }

  /**
   * 执行注册用户配置
   *
   * @param {*} configs
   * @memberof ConfigManager
   */
  private async runUserConfig() {
    for (const configInfoKey in this.userConfig) {
      if (configInfoKey === 'plugins') return;
      const configInfo = this.userConfigRegistration[configInfoKey];

      // 配置属性未注册
      if (!configInfo) {
        throw new Error(
          `[Config File]: Config key '${configInfoKey}' is not supported.`
        );
      }

      const { name, validation } = configInfo;
      const configValue = this.userConfig[name];

      // 配置值校验
      if (validation) {
        const validationResult = await validation(configValue);
        assert(
          validationResult,
          `${name} did not pass validation, result: ${validationResult}`
        );
      }

      // 配置值更新到默认 webpack 配置
      if (configInfo.configWebpack) {
        await configInfo.configWebpack(this.config, configValue);
      }
    }
  }

  /**
   * 执行插件
   *
   * @private
   * @memberof ConfigManager
   */
  private async runPlugins() {
    for (const plugin of this.userConfig.plugins) {
      const pluginPath = require.resolve(plugin, { paths: [process.cwd()] });
      const pluginFn = require(pluginPath);
      await pluginFn(this.config);
    }
  }

  /**
   * webpack 配置初始化
   */
  public async setup() {
    // 获取用户配置
    this.getUserConfig();

    // 用户配置校验及合并
    await this.runUserConfig();

    // 执行插件
    await this.runPlugins();
  }
}

export default ConfigManager;
