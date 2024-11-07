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

function showMainMenu() {
  consola.prompt("What do you want to do?", {
    type: "select",
    options: [
      {
        label: "Everything - Fresh Install",
        value: "bootstrap",
      },
      {
        label: "01 Install Coolify",
        value: "installCoolify",
      },
      {
        label: "02 Install and Configure Applications",
        value: "createResources",
      },
    ],
  });
}

async function taskDone() {
  const result = await consola.prompt("Do you want to do more?", {
    type: "confirm",
    initial: true,
  });

  if (!result) {
    consola.info("Ok, bye!");
    process.exit(0);
    return;
  }

  showMainMenu();
}

program
  .command("bootstrap")
  .description("Bootstrap this machine as a Community Server")
  .action(async () => {
    await installCoolifyIfNeeded();
    await createCoolifyResources();

    taskDone();
  });

program
  .command("install:coolify")
  .description("Install Coolify")
  .action(async () => {
    await installCoolifyIfNeeded();

    taskDone();
  });

program
  .command("create:resources")
  .description("Create Coolify Resources (Applications, etc.)")
  .action(async () => {
    await createCoolifyResources();

    taskDone();
  });

program.parse();

showMainMenu();
