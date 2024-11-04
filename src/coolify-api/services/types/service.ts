export interface CoolifyService {
  id: number;
  uuid: string;
  name: string;
  environment_id: number;
  server_id: number;
  description: string;
  docker_compose_raw: string;
  docker_compose: string;
  destination_type: string;
  destination_id: number;
  connect_to_docker_network: boolean;
  is_container_label_escape_enabled: boolean;
  is_container_label_readonly_enabled: boolean;
  config_hash: string;
  service_type: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
