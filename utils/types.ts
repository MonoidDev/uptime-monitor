import { MicroRequest } from "apollo-server-micro/dist/types";
import { ServerResponse } from "http";

export type RequestHandler = (req: MicroRequest, res: ServerResponse) => Promise<void>;

export type RequestObjectHandler<T = unknown> = (o: {req: MicroRequest, res: ServerResponse}) => Promise<T>;
