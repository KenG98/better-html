#!/usr/bin/env node

const program = require('commander')
const driver = require('./src/driver.js')

program
  .command('init <dir> [template(empty|basic|tutorial|advanced)]')
  .action(driver.init)

program
    .command('generate <dir>')
    .action(driver.generate)

program
  .command('serve <dir> [port]')
  .action(driver.serve)

program
	.command('watch <dir> [port]')
	.action(driver.watch)

program.parse(process.argv)
