import consola from "consola";
import { installCoolify } from "../../bootstrap/coolify";
import { Coolify, CoolifyFailedVerificationReason } from "../../utils/coolify";

export async function bootstrapCoolify() {
  consola.info("Bootstrapping Coolify");

  const coolifyApiClient = Coolify.get();

  const { verified, reason } = await Coolify.verifyInstallation();

  if (
    !verified &&
    reason !== CoolifyFailedVerificationReason.CoolifyNotInstalled
  ) {
    consola.error("Cannot proceed! " + reason);
    return;
  }

  if (verified) {
    consola.success("Coolify is already installed, skipping installation");
    return;
  }

  consola.info("Coolify is not installed");
  const wantsToInstall = await consola.prompt(
    "Do you want to install Coolify? (y/n)",
    {
      type: "confirm",
      initial: true,
    }
  );

  if (!wantsToInstall) {
    consola.info("Ok, bye!");
    return;
  }

  const { success, error } = await installCoolify();

  if (!success) {
    consola.error("Failed to install Coolify");
    consola.error(error);
    return;
  }

  consola.success("Coolify installed successfully");
}
