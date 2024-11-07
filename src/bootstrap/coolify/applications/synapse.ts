import consola from "consola";
import { Coolify } from "../../../coolify-api";
import { getServerSelectionFromUser } from "../../../utils/coolify";
import { ExecutionResult } from "../../../utils/execution-result";
import { CoolifyApplication } from "../../../coolify-api/applications/types/application";
import {
  promptUserForSynapseEnvVariables,
  SynapseEnvVariables,
  SynapseEnvVariablesFromUser,
} from "./synapse.env";
import { randomBytes } from "crypto";
import { waitForUserToContinue } from "../../../utils/cli";

function createSecret() {
  const secret = randomBytes(32).toString("hex");
  return secret;
}

async function configureSynapseEnv(
  applicationUUID: string,
  keycloakServiceUUID: string,
  domains: {
    root: string;
    synapse: string;
    nginx: string;
    slidingSync: string;
    masAuthenticationService: string;
  }
) {
  const api = Coolify.get();
  const keycloakApplication = await api.services.getByUUID(keycloakServiceUUID);
  const keycloakFQDN = keycloakApplication.applications[0].fqdn;

  const knownEnvVariables: Omit<
    SynapseEnvVariables,
    keyof SynapseEnvVariablesFromUser
  > = {
    SYNAPSE_FQDN: domains.synapse,
    SYNAPSE_SYNC_FQDN: domains.slidingSync,
    SYNAPSE_MAS_FQDN: domains.masAuthenticationService,
    KEYCLOAK_FQDN: keycloakFQDN,

    POSTGRES_SYNAPSE_DB: "synapse",
    POSTGRES_SYNAPSE_USER: "synapse",
    POSTGRES_SYNAPSE_PASSWORD: createSecret(),

    POSTGRES_SYNAPSE_MAS_DB: "synapse-mas",
    POSTGRES_SYNAPSE_MAS_USER: "mas",
    POSTGRES_SYNAPSE_MAS_PASSWORD: createSecret(),

    POSTGRES_SLIDING_SYNC_DB: "synapse-sync",
    POSTGRES_SLIDING_SYNC_USER: "sync",
    POSTGRES_SLIDING_SYNC_PASSWORD: createSecret(),

    KEYCLOAK_UPSTREAM_OAUTH_PROVIDER_ID: "01H8PKNWKKRPCBW4YGH1RWV279",
    KEYCLOAK_REALM_IDENTIFIER: "attraktor",
    AUTHENTICATION_ISSUER: domains.root,
    SLIDING_SYNC_SECRET: createSecret(),
    SYNAPSE_MAS_SECRET: createSecret(),
    SYNAPSE_API_ADMIN_TOKEN: createSecret(),
  };

  const env: SynapseEnvVariables = {
    ...(await promptUserForSynapseEnvVariables()),
    ...knownEnvVariables,
  };

  await Promise.all(
    Object.entries(env).map(([key, value]) => {
      return api.applications.setEnv(applicationUUID, key, value);
    })
  );
}

export async function getOrCreateSynapse(
  projectUUID: string,
  keycloakServiceUUID: string
): Promise<ExecutionResult<"", CoolifyApplication>> {
  const api = Coolify.get();

  const server = await getServerSelectionFromUser();

  if (!server) {
    throw new Error("No Server selected");
  }

  const baseDomain = await consola.prompt(
    "Please choose a domain for your matrix server. E.g. matrix.attraktor.org",
    {
      type: "text",
      initial: "matrix.attraktor.org",
    }
  );

  const nginxDomain = `https://${baseDomain}:80`;
  const synapseDomain = `https://synapse.${baseDomain}:8008`;
  const slidingSyncDomain = `https://sliding-sync.${baseDomain}:8009`;
  const masAuthenticationServiceDomain = `https://mas.${baseDomain}:8080`;

  const application = await api.applications.createFromPublicRepo({
    project_uuid: projectUUID,
    server_uuid: server.uuid,
    environment_name: "production",
    git_repository: "https://github.com/attraktorhh/matrix.git",
    git_branch: "main",
    ports_exposes: "",
    build_pack: "dockercompose",
    docker_compose_domains: [
      { containerName: "nginx", domain: nginxDomain, port: 80 },
      { containerName: "synapse", domain: synapseDomain, port: 8008 },
      { containerName: "sliding-sync", domain: slidingSyncDomain, port: 8009 },
      {
        containerName: "mas",
        domain: masAuthenticationServiceDomain,
        port: 8080,
      },
    ],
    instant_deploy: false,
  });

  await configureSynapseEnv(application.uuid, keycloakServiceUUID, {
    nginx: nginxDomain,
    synapse: synapseDomain,
    slidingSync: slidingSyncDomain,
    masAuthenticationService: masAuthenticationServiceDomain,
    root: baseDomain,
  });

  consola.success("Synapse created successfully");

  consola.box(
    `Please open the synapse application in coolify and verify the applied env variables, settings and domains. When changing domains, make sure to also change them in the envs and vise-versa.`
  );

  await waitForUserToContinue();

  return {
    success: true,
    result: application,
  };
}
