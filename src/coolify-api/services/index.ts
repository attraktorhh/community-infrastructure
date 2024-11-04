import { Coolify } from "..";
import { CoolifyService } from "./types/service";
import { CreateServiceParams } from "./types/service.create";

export class CoolifyServices {
  private root: Coolify;

  constructor(api: Coolify) {
    this.root = api;
  }

  public async list(): Promise<CoolifyService[]> {
    return await this.root.fetch("/api/v1/services");
  }

  public async create(
    params: CreateServiceParams
  ): Promise<CoolifyService> {
    return await this.root.fetch("/api/v1/services", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }
}
