"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const assert = require("assert");
class ConfigManager {
    constructor(config, userConfig) {
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
    registerUserConfig(configs) {
        configs.forEach((conf) => {
            const configName = conf.name;
            // 判断配置属性是否已注册
            if (this.userConfigRegistration[configName]) {
                throw new Error(`[Config File]: ${configName} already registered in userConfigRegistration.`);
            }
            // 添加配置的注册信息
            this.userConfigRegistration[configName] = conf;
            // 如果当前项目的用户配置中不存在该配置值，则使用该配置注册时的默认值
            if (_.isUndefined(this.userConfig[configName]) &&
                Object.prototype.hasOwnProperty.call(conf, 'defaultValue')) {
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
    runUserConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const configInfoKey in this.userConfig) {
                const configInfo = this.userConfigRegistration[configInfoKey];
                // 配置属性未注册
                if (!configInfo) {
                    throw new Error(`[Config File]: Config key '${configInfoKey}' is not supported.`);
                }
                const { name, validation } = configInfo;
                const configValue = this.userConfig[name];
                // 配置值校验
                if (validation) {
                    const validationResult = yield validation(configValue);
                    assert(validationResult, `${name} did not pass validation, result: ${validationResult}`);
                }
                // 配置值更新到默认 webpack 配置
                if (configInfo.configWebpack) {
                    yield configInfo.configWebpack(this.config, configValue);
                }
            }
        });
    }
    /**
     * webpack 配置初始化
     */
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.runUserConfig();
        });
    }
}
exports.default = ConfigManager;
