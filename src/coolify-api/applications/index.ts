import { Coolify } from "..";
import { CoolifyApplication } from "./types/application";
import { CreateApplicationFromPrivateRepoUsingDeployTokenParams } from "./types/application.create.private-deploy-token";
import { CreateApplicationFromPublicRepo } from "./types/application.create.public-repo";

export class CoolifyApplications {
  private root: Coolify;

  constructor(api: Coolify) {
    this.root = api;
  }

  public async list(): Promise<CoolifyApplication[]> {
    return await this.root.fetch("/api/v1/applications");
  }

  public async createFromPrivateRepoUsingDeployToken(
    params: CreateApplicationFromPrivateRepoUsingDeployTokenParams
  ): Promise<CoolifyApplication> {
    return this.createFromPublicRepo(params);
  }

  public async createFromPublicRepo(
    params: CreateApplicationFromPublicRepo
  ): Promise<CoolifyApplication> {
    let docker_compose_domains;
    if (params.docker_compose_domains) {
      docker_compose_domains = JSON.stringify(
        Object.fromEntries(
          params.docker_compose_domains.map((mapping) => [
            mapping.containerName,
            `${mapping.domain}:${mapping.port}`,
          ])
        )
      );
    }

    return await this.root.fetch("/api/v1/applications", {
      method: "POST",
      body: JSON.stringify({
        ...params,
        docker_compose_domains,
      }),
    });
  }

  public async setEnv(applicationUUID: string, key: string, value: string) {
    await this.root.fetch(`/api/v1/applications/${applicationUUID}/envs`, {
      method: "PATCH",
      body: JSON.stringify({
        key,
        value,
      }),
    });
  }
}
