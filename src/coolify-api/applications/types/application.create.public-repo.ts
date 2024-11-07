export interface CreateApplicationFromPublicRepo {
  project_uuid: string;
  server_uuid: string;
  environment_name: string;
  git_repository: string;
  git_branch: string;
  ports_exposes: string;
  destination_uuid?: string;
  build_pack: 'nixpacks' | 'static' | 'dockerfile' | 'dockercompose';
  domains?: string;
  install_command?: string;
  build_command?: string;
  start_command?: string;
  ports_mappings?: string;
  docker_compose_domains?: DockerComposeDomain[];
  instant_deploy?: boolean;
}

interface DockerComposeDomain {
  domain: string;
  containerName: string;
  port: number;
}