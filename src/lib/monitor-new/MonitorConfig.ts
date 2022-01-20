import { MonitorPlugin } from './MonitorPlugin';

export interface MonitorConfig {
  port: number;
  host: string;
  concurrency: number;
  plugins: MonitorPlugin[];
}
