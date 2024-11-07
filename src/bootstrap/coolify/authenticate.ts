import consola from "consola";
import { ExecutionResult } from "../../utils/execution-result";
import { Coolify, CoolifyAuthenticationFailureReason } from "../../coolify-api";
import { getIpOfCurrentMachine } from "../../utils/network";


export async function authenticateCoolifyIfNeeded(): Promise<
  ExecutionResult<CoolifyAuthenticationFailureReason>
> {
  if (Coolify.isAuthenticated) {
    return {
      success: true,
    }
  }

  const hasToken = await consola.prompt(
    "Do you have a Coolify Api Token at hand?",
    {
      type: "confirm",
      initial: false,
    }
  );

  if (!hasToken) {
    consola.info(
      "No problem, open this link in your browser and create a new token"
    );
    consola.warn(
      "You might need to enable API access firt, you will see a corresponding message in the Coolify UI"
    );

    const ip = await getIpOfCurrentMachine();
    consola.info(`Local: http://localhost:8000/security/api-tokens`);
    consola.info(`Network: http://${ip}:8000/security/api-tokens`);
  }

  let token = "";
  while (!token) {
    token = await consola.prompt("Please enter your Coolify Api Token", {
      type: "text",
    });
    token = token.trim();
  }

  const { success, reason } = await Coolify.authenticate(token);
  if (!success) {
    return {
      success: false,
      reason,
    };
  }

  consola.success("Coolify authenticated successfully");

  return {
    success: true,
  };
}
