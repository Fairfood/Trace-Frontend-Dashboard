export interface NotificationPreference {
  name: string;
  type: number;
  is_blocked: boolean;
  node?: string;
}

export interface Params {
  node: string;
  type: number;
  is_blocked: boolean;
}
