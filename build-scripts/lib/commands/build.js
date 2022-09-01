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
const path = require("path");
const webpack = require("webpack");
const build_1 = require("../configs/build");
const ConfigManager_1 = require("../core/ConfigManager");
module.exports = () => __awaiter(void 0, void 0, void 0, function* () {
    const rootDir = process.cwd();
    // 初始化配置管理类
    const manager = new ConfigManager_1.default(build_1.default);
    // 注册用户配置
    manager.registerUserConfig([
        {
            // entry 配置
            name: 'entry',
            // 配置值校验
            validation: (value) => __awaiter(void 0, void 0, void 0, function* () {
                return typeof value === 'string';
            }),
            // 配置值合并
            configWebpack: (defaultConfig, value) => __awaiter(void 0, void 0, void 0, function* () {
                defaultConfig.entry = path.resolve(rootDir, value);
            }),
        },
        {
            // outputDir 配置
            name: 'outputDir',
            // 配置值校验
            validation: (value) => __awaiter(void 0, void 0, void 0, function* () {
                return typeof value === 'string';
            }),
            // 配置值合并
            configWebpack: (defaultConfig, value) => __awaiter(void 0, void 0, void 0, function* () {
                defaultConfig.output.path = path.resolve(rootDir, value);
            }),
        },
    ]);
    // webpack 配置初始化
    yield manager.setup();
    // 实例化 webpack
    const compiler = webpack(manager.config);
    // 执行 webpack 编译
    compiler.run((err, stats) => {
        compiler.close((closeErr) => { });
    });
});
