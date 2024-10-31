export interface CreateApplicationFromPrivateRepoUsingDeployTokenParams {
  project_uuid: string;
  server_uuid: string;
  environment_name: string;
  private_key_uuid: string;
  git_repository: string;
  git_branch: string;
  ports_exposes: string;
  destination_uuid: string;
  build_pack: string;
}
