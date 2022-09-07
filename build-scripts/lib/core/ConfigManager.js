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
const path = require("path");
const assert = require("assert");
class ConfigManager {
    constructor() {
        /**
         * 注册 webpack 任务
         *
         * @param {string} name
         * @param {WebpackChain} chainConfig
         * @memberof ConfigManager
         */
        this.registerTask = (name, chainConfig) => {
            const exist = this.configArr.find((v) => v.name === name);
            if (!exist) {
                this.configArr.push({
                    name,
                    chainConfig,
                    modifyFunctions: [],
                });
            }
            else {
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
        this.onGetWebpackConfig = (name, fn) => {
            const config = this.configArr.find((v) => v.name === name);
            if (config) {
                config.modifyFunctions.push(fn);
            }
            else {
                throw new Error(`[Error] config '${name}' does not exist!`);
            }
        };
        /**
         * 注册用户配置
         *
         * @param {IUserConfigArgs[]} configs
         * @memberof ConfigManager
         */
        this.registerUserConfig = (configs) => {
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
        };
        /**
         * 获取用户配置
         *
         * @private
         * @return {*}
         * @memberof ConfigManager
         */
        this.getUserConfig = () => {
            const rootDir = process.cwd();
            try {
                this.userConfig = require(path.resolve(rootDir, './build.json'));
            }
            catch (error) {
                return;
            }
        };
        /**
         * 执行注册用户配置
         *
         * @param {*} configs
         * @memberof ConfigManager
         */
        this.runUserConfig = () => __awaiter(this, void 0, void 0, function* () {
            for (const configInfoKey in this.userConfig) {
                if (configInfoKey === 'plugins')
                    return;
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
                    // 遍历已注册的 webapck 任务
                    for (const webpackConfigInfo of this.configArr) {
                        yield configInfo.configWebpack(webpackConfigInfo.chainConfig, configValue);
                    }
                }
            }
        });
        /**
         * 执行插件
         *
         * @private
         * @memberof ConfigManager
         */
        this.runPlugins = () => __awaiter(this, void 0, void 0, function* () {
            for (const plugin of this.userConfig.plugins) {
                const pluginPath = require.resolve(plugin, { paths: [process.cwd()] });
                const pluginFn = require(pluginPath);
                yield pluginFn({
                    registerTask: this.registerTask,
                    registerUserConfig: this.registerUserConfig,
                    onGetWebpackConfig: this.onGetWebpackConfig,
                });
            }
        });
        /**
         * 执行 webpack 配置修改函数
         *
         * @private
         * @memberof ConfigManager
         */
        this.runWebpackModifyFns = () => __awaiter(this, void 0, void 0, function* () {
            for (const webpackConfigInfo of this.configArr) {
                webpackConfigInfo.modifyFunctions.forEach((fn) => fn(webpackConfigInfo.chainConfig));
            }
        });
        /**
         * webpack 配置初始化
         */
        this.setup = () => __awaiter(this, void 0, void 0, function* () {
            // 获取用户配置
            this.getUserConfig();
            // 执行插件
            yield this.runPlugins();
            // 用户配置校验及合并
            yield this.runUserConfig();
            // 执行 webpack 配置修改函数
            yield this.runWebpackModifyFns();
        });
        this.configArr = [];
        this.userConfig = {};
        this.userConfigRegistration = {};
    }
}
exports.default = ConfigManager;
