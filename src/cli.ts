#!/usr/bin/env node

import consola from "consola";
import { bootstrapServer } from "./commands/bootstrap-server";
import { program } from "commander";

consola.wrapConsole();

program
  .name("Attraktor Community Server Setup CLI")
  .description("CLI to setup and configure the Attraktor Community Server")
  .version("0.0.1-alpha");

program
  .command("bootstrap")
  .description("Bootstrap this machine as a Community Server")
  .action(async () => {
    await bootstrapServer();
  });

program.parse();
