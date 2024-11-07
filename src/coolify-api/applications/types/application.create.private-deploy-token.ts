import { CreateApplicationFromPublicRepo } from "./application.create.public-repo";

export interface CreateApplicationFromPrivateRepoUsingDeployTokenParams
  extends CreateApplicationFromPublicRepo {
  private_key_uuid: string;
}
