export interface CoolifyServer {
  id: Number;
  uuid: string;
  name: string;
  description: string;
  ip: string;
  user: string;
  port: Number;
  proxyhigh_disk_usage_notification_sent: boolean;
  unreachable_notification_sent: boolean;
  unreachable_count: Number;
  validation_logs: string;
  log_drain_notification_sent: boolean;
  swarm_cluster: string;
  delete_unused_volumes: boolean;
  delete_unused_networks: boolean;
}
