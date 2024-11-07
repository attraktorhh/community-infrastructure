import consola from "consola";

export interface SynapseEnvVariables {
  SYNAPSE_FQDN: string;
  SYNAPSE_SYNC_FQDN: string;
  SYNAPSE_MAS_FQDN: string;
  POSTGRES_SYNAPSE_DB: string;
  POSTGRES_SYNAPSE_USER: string;
  POSTGRES_SYNAPSE_PASSWORD: string;
  POSTGRES_SYNAPSE_MAS_DB: string;
  POSTGRES_SYNAPSE_MAS_USER: string;
  POSTGRES_SYNAPSE_MAS_PASSWORD: string;
  POSTGRES_SLIDING_SYNC_DB: string;
  POSTGRES_SLIDING_SYNC_USER: string;
  POSTGRES_SLIDING_SYNC_PASSWORD: string;
  SLIDING_SYNC_SECRET: string;
  SYNAPSE_SERVER_NAME: string;
  SYNAPSE_FRIENDLY_SERVER_NAME: string;
  ADMIN_EMAIL: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  SMTP_REQUIRE_TRANSPORT_SECURITY: "true" | "false";
  SMTP_NOTIFY_FROM: string;
  KEYCLOAK_FQDN: string;
  KEYCLOAK_REALM_IDENTIFIER: string;
  KEYCLOAK_CLIENT_ID: string;
  KEYCLOAK_CLIENT_SECRET: string;
  AUTHENTICATION_ISSUER: string;
  KEYCLOAK_UPSTREAM_OAUTH_PROVIDER_ID: string;
  SYNAPSE_MAS_SECRET: string;
  SYNAPSE_API_ADMIN_TOKEN: string;
}

type OmittedVariables =
  | "SYNAPSE_FQDN"
  | "SYNAPSE_SYNC_FQDN"
  | "SYNAPSE_MAS_FQDN"
  | "POSTGRES_SYNAPSE_DB"
  | "POSTGRES_SYNAPSE_USER"
  | "POSTGRES_SYNAPSE_PASSWORD"
  | "POSTGRES_SYNAPSE_MAS_DB"
  | "POSTGRES_SYNAPSE_MAS_USER"
  | "POSTGRES_SYNAPSE_MAS_PASSWORD"
  | "POSTGRES_SLIDING_SYNC_DB"
  | "POSTGRES_SLIDING_SYNC_USER"
  | "POSTGRES_SLIDING_SYNC_PASSWORD"
  | "SLIDING_SYNC_SECRET"
  | "KEYCLOAK_FQDN"
  | "KEYCLOAK_REALM_IDENTIFIER"
  | "AUTHENTICATION_ISSUER"
  | "KEYCLOAK_UPSTREAM_OAUTH_PROVIDER_ID"
  | "SYNAPSE_MAS_SECRET"
  | "SYNAPSE_API_ADMIN_TOKEN";

export type SynapseEnvVariablesFromUser = Omit<SynapseEnvVariables, OmittedVariables>;
export async function promptUserForSynapseEnvVariables(): Promise<SynapseEnvVariablesFromUser> {
  const SYNAPSE_SERVER_NAME = await consola.prompt(
    "Name of the Matrix Server (e.g. attraktor.org), used for username prefixes: ",
    { type: "text" }
  );
  const SYNAPSE_FRIENDLY_SERVER_NAME = await consola.prompt(
    "Friendly server name (used for E-Mails or Login Screens): ",
    { type: "text" }
  );

  const ADMIN_EMAIL = await consola.prompt(
    "Admin email for support contact: ",
    { type: "text" }
  );

  consola.info("SMTP Settings for sending E-Mails");
  const SMTP_HOST = await consola.prompt("SMTP host: ", { type: "text" });
  const SMTP_PORT = parseInt(
    await consola.prompt("SMTP port: ", { type: "text" }),
    10
  );
  const SMTP_USER = await consola.prompt("SMTP user: ", { type: "text" });
  const SMTP_PASSWORD = await consola.prompt("SMTP password: ", {
    type: "text",
  });
  const smtpRequireTransportSecurityBool = await consola.prompt(
    "Require transport security? ",
    { type: "confirm" }
  );
  const SMTP_REQUIRE_TRANSPORT_SECURITY = smtpRequireTransportSecurityBool
    ? "true"
    : "false";
  const SMTP_NOTIFY_FROM = await consola.prompt("SMTP notify from address: ", {
    type: "text",
  });

  consola.info("Keycloak client credentials");
  const KEYCLOAK_CLIENT_ID = await consola.prompt("Keycloak client ID: ", {
    type: "text",
  });
  const KEYCLOAK_CLIENT_SECRET = await consola.prompt(
    "Keycloak client secret: ",
    { type: "text" }
  );

  return {
    SYNAPSE_SERVER_NAME,
    SYNAPSE_FRIENDLY_SERVER_NAME,
    ADMIN_EMAIL,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_REQUIRE_TRANSPORT_SECURITY,
    SMTP_NOTIFY_FROM,
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET,
  };
}
