import _ = require('lodash');
import assert = require('assert');

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
  configWebpack?: (defaultConfig: IConfig, value: any) => void;
}

class ConfigManager {
  // webpack 配置
  public config: IConfig;
  // 用户配置
  public userConfig: IConfig;
  // 用户配置注册信息
  private userConfigRegistration: IUserConfigRegistration;

  constructor(config: IConfig, userConfig: IConfig) {
    this.config = config;
    this.userConfig = userConfig;
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
   * 执行用户配置
   *
   * @param {*} configs
   * @memberof ConfigManager
   */
  async runUserConfig() {
    for (const configInfoKey in this.userConfig) {
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
   * webpack 配置初始化
   */
  async setup() {
    await this.runUserConfig();
  }
}

export default ConfigManager;
