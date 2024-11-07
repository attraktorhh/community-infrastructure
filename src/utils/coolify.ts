import consola from "consola";
import { Coolify } from "../coolify-api";
import { CoolifyServer } from "../coolify-api/types/server";

export async function getServerSelectionFromUser(): Promise<CoolifyServer> {
  const api = Coolify.get();

  const servers = await api.listServers();

  if (servers.length <= 1) {
    return servers[0];
  }

  const { value: selectedServerUUID } = await consola.prompt(
    "Please select a server",
    {
      type: "select",
      options: servers.map((server) => ({
        label: `${server.name} (${server.ip})`,
        value: server.uuid,
      })),
    }
  );

  return servers.find((s) => s.uuid === selectedServerUUID);
}
