import { Coolify } from "..";
import { CoolifyProject } from "./types/project";
import { CreateProjectParams } from "./types/project.create";

export class CoolifyProjects {
  private root: Coolify;

  constructor(api: Coolify) {
    this.root = api;
  }

  public async list(): Promise<CoolifyProject[]> {
    return await this.root.fetch("/api/v1/projects");
  }

  public async create(
    params: CreateProjectParams
  ): Promise<CoolifyProject> {
    return await this.root.fetch("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}
