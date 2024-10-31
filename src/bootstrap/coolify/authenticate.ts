import consola from "consola";
import { networkInterfaces } from "os";
import { ExecutionResult } from "../../utils/execution-result";
import { Coolify, CoolifyAuthenticationFailureReason } from "../../coolify-api";

async function getIpOfCurrentMachine() {
  let ip = "0.0.0.0";
  const ips = networkInterfaces();

  Object.keys(ips).forEach(function (_interface) {
    ips[_interface].forEach(function (_dev) {
      if (_dev.family === "IPv4" && !_dev.internal) ip = _dev.address;
    });
  });

  return ip;
}

export async function authenticateCoolify(): Promise<
  ExecutionResult<CoolifyAuthenticationFailureReason>
> {
  const hasToken = await consola.prompt(
    "Do you have a Coolify Api Token at hand?",
    {
      type: "confirm",
      initial: false,
    }
  );

  if (!hasToken) {
    const ip = await getIpOfCurrentMachine();

    consola.info(
      "No problem, open this link in your browser and create a new token"
    );
    consola.warn(
      "You might need to enable API access firt, you will see a corresponding message in the Coolify UI"
    );

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
