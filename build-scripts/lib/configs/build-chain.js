"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config = require("webpack-chain");
const path = require('path');
const rootDir = process.cwd();
const config = new Config();
config.entry('index').add('./src/index');
config.module
    .rule('ts')
    .test(/\.ts?$/)
    .use('ts-loader')
    .loader(require.resolve('ts-loader'));
config.resolve.extensions.add('.ts').add('.js');
config.output.filename('main.js');
config.output.path(path.resolve(rootDir, './dist'));
exports.default = config;
