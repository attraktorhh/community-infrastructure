import consola from "consola";
import { Coolify, CoolifyFailedVerificationReason } from "../../coolify-api";
import { ExecutionResult } from "../../utils/execution-result";
import { getIpOfCurrentMachine } from "../../utils/network";
import { waitForUserToContinue } from "../../utils/cli";

async function installCoolify(): Promise<{
  success: boolean;
  error?: Error;
}> {
  const { $ } = await import("execa");
  consola.info("Installing Coolify...");

  try {
    await $`curl -fsSL https://cdn.coollabs.io/coolify/install.sh`.pipe("bash");
  } catch (error) {
    return {
      success: false,
      error,
    };
  }

  consola.info("Verifying installation...");
  const api = Coolify.get();
  const { verified, reason } = await api.verifyInstallation();

  if (!verified) {
    return {
      success: false,
      error: new Error(reason),
    };
  }

  return {
    success: true,
  };
}

export enum BootstrapFailureReason {
  CoolifyNotInstalled = "Coolify is not installed",
  UserDeclinedInstallation = "User declined installation",
  CoolifyInstallationFailed = "Coolify installation failed",
  CoolifyNoServersFound = "No servers found",
}

async function waitForUserToSetCoolifyDomain(): Promise<
  ExecutionResult<BootstrapFailureReason>
> {
  const api = Coolify.get();
  const servers = await api.listServers();
  const server = servers[0];

  if (!server) {
    consola.error(
      "There seems to be no servers in Coolify, cannot continue. Please check your Coolify installation."
    );
    return {
      success: false,
      reason: BootstrapFailureReason.CoolifyNoServersFound,
    };
  }

  const ip = await getIpOfCurrentMachine();
  const localFQDN = `Local: http://localhost:8000/server/${server.uuid}`;
  const networkFQDN = `Network: http://${ip}:8000/server/${server.uuid}`;

  consola.box(
    "Coolify is now ready, but you need to set the wildcard domain to be used for your Resources. Please open\n" +
      "\n" +
      `${localFQDN}\n` +
      `${networkFQDN}\n` +
      "\n"
  );

  await waitForUserToContinue();
}

export async function installCoolifyIfNeeded(): Promise<
  ExecutionResult<BootstrapFailureReason | CoolifyFailedVerificationReason>
> {
  consola.info("Bootstrapping Coolify");

  const api = Coolify.get();
  const { verified, reason } = await api.verifyInstallation();

  if (
    !verified &&
    reason !== CoolifyFailedVerificationReason.CoolifyNotInstalled
  ) {
    consola.error("Cannot proceed! " + reason);

    return {
      success: false,
      reason,
    };
  }

  if (verified) {
    consola.success("Coolify is already installed, skipping installation");
    await waitForUserToSetCoolifyDomain();
    return {
      success: true,
    };
  }

  consola.info("Coolify is not installed");
  const wantsToInstall = await consola.prompt(
    "Do you want to install Coolify? (y/n)",
    {
      type: "confirm",
      initial: false,
    }
  );

  if (!wantsToInstall) {
    consola.info("Ok, bye!");
    return {
      success: false,
      reason: BootstrapFailureReason.UserDeclinedInstallation,
    };
  }

  const { success, error } = await installCoolify();

  if (!success) {
    consola.error("Failed to install Coolify");
    consola.error(error);
    return {
      success: false,
      reason: BootstrapFailureReason.CoolifyInstallationFailed,
    };
  }

  consola.success("Coolify installed successfully");
  await waitForUserToSetCoolifyDomain();
  return { success: true };
}
