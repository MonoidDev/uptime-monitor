export type StaticUrls =
  | "/auth/createUser"
  | "/auth/login"
  | "/"
  | "/monitoring/events"
  | "/monitoring/sslStatus"
  | "/monitoring/traces"
  | "/monitoring/websites/add"
  | "/monitoring/websites"
  | "/settings/changePassword"
  | "/settings/user"
  | "/urls";
export type DynamicUrls =
  | "/monitoring/websiteStatus/[id]"
  | "/monitoring/websites/[id]";
export type Urls = DynamicUrls | StaticUrls;

export type DynamicUrlParamMap = {
  "/monitoring/websiteStatus/[id]": {
    id: string | number;
  };
  "/monitoring/websites/[id]": {
    id: string | number;
  };
};

export const urls = [
  "/auth/createUser",
  "/auth/login",
  "/",
  "/monitoring/events",
  "/monitoring/sslStatus",
  "/monitoring/traces",
  "/monitoring/websiteStatus/[id]",
  "/monitoring/websites/[id]",
  "/monitoring/websites/add",
  "/monitoring/websites",
  "/settings/changePassword",
  "/settings/user",
  "/urls",
];

export const url = (x: Urls) => x;

export const dynamicUrl = <U extends DynamicUrls>(
  x: U,
  params: DynamicUrlParamMap[U]
) => {
  let r: string = x;
  for (const [key, value] of Object.entries(params)) {
    r = r.replace("[" + key + "]", String(value));
  }
  return r;
};
