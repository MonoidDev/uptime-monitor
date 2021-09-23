export type Urls =
  | "/auth/create-user"
  | "/auth/login"
  | "/"
  | "/monitoring/events"
  | "/monitoring"
  | "/monitoring/traceDetails"
  | "/monitoring/traces"
  | "/monitoring/websiteDetails"
  | "/monitoring/websites"
  | "/urls";
export const urls = [
  "/auth/create-user",
  "/auth/login",
  "/",
  "/monitoring/events",
  "/monitoring",
  "/monitoring/traceDetails",
  "/monitoring/traces",
  "/monitoring/websiteDetails",
  "/monitoring/websites",
  "/urls",
];
export const url = (x: Urls) => x;
