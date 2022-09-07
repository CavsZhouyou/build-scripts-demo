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
const webpack = require("webpack");
const ConfigManager_1 = require("../core/ConfigManager");
module.exports = () => __awaiter(void 0, void 0, void 0, function* () {
    // 初始化配置管理类
    const manager = new ConfigManager_1.default();
    // webpack 配置初始化
    yield manager.setup();
    // 实例化 webpack
    const compiler = webpack(manager.configArr.map((config) => config.chainConfig.toConfig()));
    // 执行 webpack 编译
    compiler.run((err, stats) => {
        compiler.close((closeErr) => { });
    });
});
