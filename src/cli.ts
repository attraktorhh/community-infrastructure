#!/usr/bin/env node

import consola from "consola";
import { program } from "commander";
import { installCoolifyIfNeeded } from "./bootstrap/coolify/install";
import { createCoolifyResources } from "./bootstrap/coolify/applications";

consola.wrapConsole();

program
  .name("Attraktor Community Server Setup CLI")
  .description("CLI to setup and configure the Attraktor Community Server")
  .version("0.0.1-alpha");

async function bootstrap() {
  const {result} = await installCoolifyIfNeeded();
  if (!result) {
    return;
  }
  await createCoolifyResources();
}

program
  .command("bootstrap")
  .description("Bootstrap this machine as a Community Server")
  .action(async () => {
    await bootstrap();
  });

program
  .command("install:coolify")
  .description("Install Coolify")
  .action(async () => {
    await installCoolifyIfNeeded();
  });

program
  .command("create:resources")
  .description("Create Coolify Resources (Applications, etc.)")
  .action(async () => {
    await createCoolifyResources();
  });

program.parse();
