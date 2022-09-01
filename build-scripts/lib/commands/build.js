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
module.exports = () => __awaiter(void 0, void 0, void 0, function* () {
    const rootDir = process.cwd();
    // 获取用户自定义配置
    const userConfig = require(path.resolve(rootDir, './build.json'));
    // 定义 webpack 配置
    const config = {
        entry: path.resolve(rootDir, userConfig.entry),
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    use: require.resolve('ts-loader'),
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        output: {
            filename: 'main.js',
            path: path.resolve(rootDir, './dist'),
        },
    };
    // 实例化 webpack
    const compiler = webpack(config);
    // 执行 webpack 编译
    compiler.run((err, stats) => {
        compiler.close((closeErr) => { });
    });
});
