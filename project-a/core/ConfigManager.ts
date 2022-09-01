const _ = require('lodash');

class ConfigManager {
  constructor(config, userConfig) {
    // webpack 配置
    this.config = config;
    // 用户配置
    this.userConfig = userConfig;
    // 用户配置的注册信息
    this.userConfigRegistration = {};
  }

  /**
   * 注册用户配置
   *
   * @param {*} configs
   * @memberof ConfigManager
   */
  registerUserConfig(configs) {
    configs.forEach((conf) => {
      const configName = conf.name;

      // 判断配置属性是否已注册
      if (this.userConfigRegistration[configName]) {
        throw new Error(
          `${configName} already registered in userConfigRegistration.`
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
          `[Config File] Config key '${configInfoKey}' is not supported.`
        );
      }

      const { name, validation } = configInfo;
      const configValue = this.userConfig[name];

      // 配置值校验
      if (validation) {
        validationInfo = await validation(configValue);
        assert(
          validationInfo,
          `${name} did not pass validation, result: ${validationInfo}`
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
