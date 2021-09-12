import { ServerResponse, IncomingMessage } from "http";

export type NextIncomingMessage = IncomingMessage & {
  cookies?: {
    [key: string]: any ,
  },
}

export type RequestHandler = (req: NextIncomingMessage, res: ServerResponse) => Promise<void>;

export type RequestObjectHandler<T = unknown> = (o: {req: NextIncomingMessage, res: ServerResponse}) => Promise<T>;
