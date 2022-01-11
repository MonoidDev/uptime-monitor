export enum WebsiteEventSource {
  Enabled = 'Enabled',
  Disabled = 'Disabled',
  Available = 'Available',
  NotAvailable = 'NotAvailable',
  HighLatency = 'HighLatency',
}

export type WebsiteEventDataEnabled = void;
export type WebsiteEventDataDisabled = void;
export type WebsiteEventDataAvailable = void;
export type WebsiteEventDataNotAvailable = void;

export type WebsiteEventDataHighLatency = {
  isActive: boolean;
  duration: number;
};
