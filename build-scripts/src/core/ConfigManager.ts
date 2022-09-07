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

// webpack 配置修改函数类型定义
type IModifyConfigFn = (defaultConfig: WebpackChain) => void;

class ConfigManager {
  // webpack 配置
  public config: WebpackChain;
  // 用户配置
  public userConfig: IConfig;
  // 用户配置注册信息
  private userConfigRegistration: IUserConfigRegistration;
  // 已注册的 webpack 配置修改函数
  private modifyConfigFns: IModifyConfigFn[];

  constructor() {
    this.userConfig = {};
    this.userConfigRegistration = {};
    this.modifyConfigFns = [];
  }

  /**
   * 设置 webpack 配置
   *
   * @param {WebpackChain} config
   * @memberof ConfigManager
   */
  public setConfig = (config: WebpackChain) => {
    this.config = config;
  };

  /**
   * 注册 webpack 配置修改函数
   *
   * @param {(defaultConfig: WebpackChain) => void} fn
   * @memberof ConfigManager
   */
  public onGetWebpackConfig = (fn: (defaultConfig: WebpackChain) => void) => {
    this.modifyConfigFns.push(fn);
  };

  /**
   * 注册用户配置
   *
   * @param {IUserConfigArgs[]} configs
   * @memberof ConfigManager
   */
  public registerUserConfig = (configs: IUserConfigArgs[]) => {
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
  };

  /**
   * 获取用户配置
   *
   * @private
   * @return {*}
   * @memberof ConfigManager
   */
  private getUserConfig = () => {
    const rootDir = process.cwd();
    try {
      this.userConfig = require(path.resolve(rootDir, './build.json'));
    } catch (error) {
      console.log('Config error: build.json is not exist.');
      return;
    }
  };

  /**
   * 执行注册用户配置
   *
   * @param {*} configs
   * @memberof ConfigManager
   */
  private runUserConfig = async () => {
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
  };

  /**
   * 执行插件
   *
   * @private
   * @memberof ConfigManager
   */
  private runPlugins = async () => {
    for (const plugin of this.userConfig.plugins) {
      const pluginPath = require.resolve(plugin, { paths: [process.cwd()] });
      const pluginFn = require(pluginPath);
      await pluginFn({
        setConfig: this.setConfig,
        registerUserConfig: this.registerUserConfig,
        onGetWebpackConfig: this.onGetWebpackConfig,
      });
    }
  };

  /**
   * 执行 webpack 配置修改函数
   *
   * @private
   * @memberof ConfigManager
   */
  private runWebpackModifyFns = async () => {
    this.modifyConfigFns.forEach((fn) => fn(this.config));
  };

  /**
   * webpack 配置初始化
   */
  public setup = async () => {
    // 获取用户配置
    this.getUserConfig();

    // 执行插件
    await this.runPlugins();

    // 用户配置校验及合并
    await this.runUserConfig();

    // 执行 webpack 配置修改函数
    await this.runWebpackModifyFns();
  };
}

export default ConfigManager;
