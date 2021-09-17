export type Urls =
  | "/auth/create-user"
  | "/auth/login"
  | "/"
  | "/monitoring"
  | "/monitoring/websites";
export const url = (x: Urls) => x;
