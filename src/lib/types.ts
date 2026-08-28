export interface TimelineStep {
  label: string;
  done: boolean;
  active: boolean;
}

export interface Tracking {
  server_time: string;
  token: string;
  status: string | null;
  risk: string | null;
  customer: string | null;
  address: string | null;
  stop: { lat: number; lng: number } | null;
  current_eta: string | null;
  promised_window_start: string | null;
  promised_window_end: string | null;
  reschedule_request: boolean;
  driver: { name: string; position: { lat: number; lng: number } | null } | null;
  timeline: TimelineStep[];
}
