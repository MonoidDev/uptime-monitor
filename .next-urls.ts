export type Urls =
  | "/auth/createUser"
  | "/auth/login"
  | "/"
  | "/monitoring/events"
  | "/monitoring"
  | "/monitoring/traceDetails"
  | "/monitoring/traces"
  | "/monitoring/websiteDetails"
  | "/monitoring/websiteStatus/[id]"
  | "/monitoring/websites"
  | "/urls";
export const urls = [
  "/auth/createUser",
  "/auth/login",
  "/",
  "/monitoring/events",
  "/monitoring",
  "/monitoring/traceDetails",
  "/monitoring/traces",
  "/monitoring/websiteDetails",
  "/monitoring/websiteStatus/[id]",
  "/monitoring/websites",
  "/urls",
];
export const url = (x: Urls) => x;
