export type Urls =
  | "/auth/create-user"
  | "/auth/login"
  | "/"
  | "/monitoring"
  | "/monitoring/websites"
  | "/urls";
export const urls = [
  "/auth/create-user",
  "/auth/login",
  "/",
  "/monitoring",
  "/monitoring/websites",
  "/urls",
];
export const url = (x: Urls) => x;
