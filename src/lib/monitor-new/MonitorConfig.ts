import { MonitorPlugin } from './MonitorPlugin';

export interface MonitorConfig {
  concurrency: number;
  plugins: MonitorPlugin[];
}
