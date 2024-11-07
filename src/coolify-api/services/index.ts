import { Coolify } from "..";
import { CoolifyService } from "./types/service";
import { CreateServiceParams } from "./types/service.create";
import { CoolifyServiceEnvironment } from "./types/service.environment";

export class CoolifyServices {
  private root: Coolify;

  constructor(api: Coolify) {
    this.root = api;
  }

  public async list(): Promise<CoolifyService[]> {
    return await this.root.fetch("/api/v1/services");
  }

  public async create(params: CreateServiceParams): Promise<CoolifyService> {
    return await this.root.fetch("/api/v1/services", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  public async setEnv(
    serviceUUID: string,
    key: string,
    value: string
  ): Promise<void> {
    await this.root.fetch(`/api/v1/services/${serviceUUID}/envs`, {
      method: "PATCH",
      body: JSON.stringify({
        key,
        value,
      }),
    });
  }

  public async getEnvs(
    serviceUUID: string
  ): Promise<CoolifyServiceEnvironment[]> {
    return await this.root.fetch(`/api/v1/services/${serviceUUID}/envs`);
  }

  public async getByUUID(serviceUUID: string): Promise<CoolifyService> {
    return await this.root.fetch(`/api/v1/services/${serviceUUID}`);
  }
}
