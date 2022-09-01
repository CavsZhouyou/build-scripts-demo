#!/usr/bin/env node

const program = require('commander');
const build = require('../lib/commands/build');

(async () => {
  // 命令注册
  program.command('build').description('build project').action(build);

  // 判断是否有存在运行的命令，如果有则退出已执行命令
  const proc = program.runningCommand;
  if (proc) {
    proc.on('close', process.exit.bind(process));
    proc.on('error', () => {
      process.exit(1);
    });
  }

  // 命令行参数解析
  program.parse(process.argv);

  // 如果无子命令，展示 help 信息
  const subCmd = program.args[0];
  if (!subCmd) {
    program.help();
  }
})();
