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

// webpack 任务配置定义
export interface ITaskConfig {
  name: string;
  chainConfig: WebpackChain;
  modifyFunctions: IModifyConfigFn[];
}

class ConfigManager {
  // webpack 配置列表
  public configArr: ITaskConfig[];
  // 用户配置
  public userConfig: IConfig;
  // 用户配置注册信息
  private userConfigRegistration: IUserConfigRegistration;

  constructor() {
    this.configArr = [];
    this.userConfig = {};
    this.userConfigRegistration = {};
  }

  /**
   * 注册 webpack 任务
   *
   * @param {string} name
   * @param {WebpackChain} chainConfig
   * @memberof ConfigManager
   */
  public registerTask = (name: string, chainConfig: WebpackChain) => {
    const exist = this.configArr.find((v): boolean => v.name === name);
    if (!exist) {
      this.configArr.push({
        name,
        chainConfig,
        modifyFunctions: [],
      });
    } else {
      throw new Error(`[Error] config '${name}' already exists!`);
    }
  };

  /**
   * 注册 webpack 配置修改函数
   *
   * @param {string} name
   * @param {(defaultConfig: WebpackChain) => void} fn
   * @memberof ConfigManager
   */
  public onGetWebpackConfig = (
    name: string,
    fn: (defaultConfig: WebpackChain) => void
  ) => {
    const config = this.configArr.find((v): boolean => v.name === name);

    if (config) {
      config.modifyFunctions.push(fn);
    } else {
      throw new Error(`[Error] config '${name}' does not exist!`);
    }
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
        // 遍历已注册的 webapck 任务
        for (const webpackConfigInfo of this.configArr) {
          await configInfo.configWebpack(
            webpackConfigInfo.chainConfig,
            configValue
          );
        }
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
        registerTask: this.registerTask,
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
    for (const webpackConfigInfo of this.configArr) {
      webpackConfigInfo.modifyFunctions.forEach((fn) =>
        fn(webpackConfigInfo.chainConfig)
      );
    }
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
