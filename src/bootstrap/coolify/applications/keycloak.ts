import consola from "consola";
import { Coolify, CoolifyAuthenticationFailureReason } from "../../../coolify-api";
import { ExecutionResult } from "../../../utils/execution-result";
import { authenticateCoolifyIfNeeded } from "../authenticate";
import { CoolifyService } from "../../../coolify-api/services/types/service";

export enum FailureReasons {
    NO_SERVERS_FOUND = "No servers found",
}

const KEYCLOAK_SERVICE_NAME = "Keycloak" as const;

export async function getOrCreateKeycloak(projectUUID: string): Promise<ExecutionResult<FailureReasons | CoolifyAuthenticationFailureReason, CoolifyService>> {
  const api = Coolify.get();

  const {success: authenticationSuccess, reason: authenticationFailureReason} = await authenticateCoolifyIfNeeded();
  if (!authenticationSuccess) {
    return {
      success: false,
      reason: authenticationFailureReason,
    };
  }

  const services = await api.services.list();
  const existingService = services.find((service) => service.name === KEYCLOAK_SERVICE_NAME);

  if (existingService) {
    consola.success("Keycloak is already installed, skipping installation");
    return {
      success: true,
      result: existingService,
    };
  }

  const servers = await api.listServers();
  if (servers.length === 0) {
    consola.error("No servers in coolify found, cannot continue");
    consola.info("Please create a server in coolify and try again");
    return {
      success: false,
      reason: FailureReasons.NO_SERVERS_FOUND,
    };
  }
  let selectedServer = servers[0].uuid;

  if (servers.length > 1) {
    const selection = await consola.prompt('Choose a server to install Keycloak on', {
        type: 'select',
        options: servers.map((server) => ({
            label: `${server.name} (${server.ip})`,
            value: server.uuid,
        })),
    });

    selectedServer = selection.value;
  }

  const service = await api.services.create({
    type: 'keycloak-with-postgresql',
    name: KEYCLOAK_SERVICE_NAME,
    description: 'Our central SSO service',
    project_uuid: projectUUID,
    environment_name: 'production',
    server_uuid: selectedServer,
    instant_deploy: false,
  });

  // TODO: update envs for keycloak (ask user for FQDN)
  // TODO: ask user to set FQDN as domain

  return {
    success: true,
    result: service,
  }
}