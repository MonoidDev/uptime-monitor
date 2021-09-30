export type Urls =
  | "/auth/createUser"
  | "/auth/login"
  | "/"
  | "/monitoring/events"
  | "/monitoring/traces"
  | "/monitoring/websiteStatus/[id]"
  | "/monitoring/websites/[id]"
  | "/monitoring/websites/add"
  | "/monitoring/websites"
  | "/urls";
export const urls = [
  "/auth/createUser",
  "/auth/login",
  "/",
  "/monitoring/events",
  "/monitoring/traces",
  "/monitoring/websiteStatus/[id]",
  "/monitoring/websites/[id]",
  "/monitoring/websites/add",
  "/monitoring/websites",
  "/urls",
];
export const url = (x: Urls) => x;
