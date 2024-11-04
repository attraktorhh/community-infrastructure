import consola from "consola";
import { Coolify, CoolifyFailedVerificationReason } from "../../coolify-api";
import { ExecutionResult } from "../../utils/execution-result";

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
  return { success: true };
}
