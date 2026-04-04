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

export interface GameServerDto {
  uuid: string;
  server_name: string;
  owner: UserDto;
  status: ServerStatus;
  design: 'DARK' | 'LIGHT';
  created_on: string;
  timestamp_last_started?: string;
  game_uuid?: string;
  docker_image_name?: string;
  docker_image_tag?: string;
  docker_hardware_limits?: HardwareLimits;
  port_mappings?: PortMapping[];
  environment_variables?: { key: string; value: string }[];
  access_groups?: AccessGroup[];
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
