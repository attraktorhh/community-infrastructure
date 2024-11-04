import { Coolify } from "..";
import { CoolifyApplication } from "./types/application";
import { CreateApplicationFromPrivateRepoUsingDeployTokenParams } from "./types/application.create.private-deploy-token";

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
    return await this.root.fetch("/api/v1/applications", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}
