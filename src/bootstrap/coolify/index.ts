import consola from "consola";
import { Coolify } from "../../utils/coolify";

export async function installCoolify(): Promise<{
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
  const { verified, reason } = await Coolify.verifyInstallation();

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
