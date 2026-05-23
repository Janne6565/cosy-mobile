export interface ApiResponse<T> {
  status_code: number;
  success: boolean;
  data: T;
  error: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface DirectLoginResponse {
  refreshToken: string;
}

export type UserRole = 'OWNER' | 'ADMIN' | 'QUOTA_USER';

export interface UserDto {
  uuid: string;
  username: string;
  role: UserRole;
  docker_hardware_limits?: {
    docker_max_cpu_cores: number;
    docker_memory_limit: number;
  };
}

export type ServerStatus =
  | 'RUNNING'
  | 'STOPPED'
  | 'FAILED'
  | 'PULLING_IMAGE'
  | 'AWAITING_UPDATE'
  | 'STOPPING';

export interface PortMapping {
  host_port: number;
  container_port: number;
  protocol: string;
}

export interface HardwareLimits {
  docker_max_cpu_cores: number;
  docker_memory_limit: number;
}

export interface AccessGroup {
  uuid: string;
  name: string;
}

export type LayoutSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type DashboardLayoutType = 'METRIC' | 'LOGS' | 'FREETEXT';

export interface MetricLayout {
  uuid?: string;
  size?: LayoutSize;
  metric_type?: string;
}

export interface KeyValueEntry {
  key: string;
  value: string;
}

export interface PrivateDashboardLayout {
  uuid?: string;
  size?: LayoutSize;
  layout_type?: DashboardLayoutType;
  metric_type?: string;
  title?: string;
  content?: KeyValueEntry[];
  valid?: boolean;
}

export type ServerDesign = 'HOUSE' | 'CASTLE';

export interface RCONConfiguration {
  enabled?: boolean;
  port?: number;
  password?: string;
  port_valid?: boolean;
  password_valid?: boolean;
}

export interface VolumeMountDto {
  uuid?: string;
  container_path: string;
}

export interface WebhookDto {
  uuid?: string;
  webhook_type?: string;
  webhook_url?: string;
  enabled?: boolean;
  subscribed_events?: string[];
}

export interface GameServerDto {
  uuid: string;
  server_name: string;
  owner: UserDto;
  status: ServerStatus;
  design?: ServerDesign;
  created_on: string;
  timestamp_last_started?: string;
  game_uuid?: string;
  external_game_id?: number;
  docker_image_name?: string;
  docker_image_tag?: string;
  docker_hardware_limits?: HardwareLimits;
  execution_command?: string[];
  port_mappings?: PortMapping[];
  environment_variables?: { key: string; value: string }[];
  volume_mounts?: VolumeMountDto[];
  access_groups?: AccessGroup[];
  rcon_configuration?: RCONConfiguration;
  metric_layout?: MetricLayout[];
  private_dashboard_layouts?: PrivateDashboardLayout[];
  webhooks?: WebhookDto[];
}

export interface GameServerUpdateDto {
  server_name: string;
  docker_image_name: string;
  docker_image_tag: string;
  docker_hardware_limits?: HardwareLimits;
  port_mappings?: PortMapping[];
  execution_command?: string[];
  environment_variables?: { key: string; value: string }[];
  volume_mounts?: VolumeMountDto[];
  external_game_id?: number;
}

export interface ServerStatusDto {
  status: ServerStatus;
}

export interface LogEntry {
  timestamp: string;
  message: string;
}

export interface MetricValues {
  cpu_percent: number | null;
  memory_percent: number | null;
  memory_usage: number | null;
  memory_limit: number | null;
  network_input: number | null;
  network_output: number | null;
  block_read: number | null;
  block_write: number | null;
}

export interface MetricPointDto {
  game_server_uuid: string;
  time: string;
  metric_values: MetricValues;
}

export interface PermissionDto {
  user: UserDto;
  permissions: string[];
}
