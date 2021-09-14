import type { User } from "@prisma/client";
import { readFileSync } from "fs";
import { sign, verify, Jwt } from 'jsonwebtoken';
import { Context } from "./context";

export interface AuthInfo extends Exclude<Jwt, undefined> {
  id: number;
  isAdmin: boolean;
}

export class Auth {
  privateKey: Buffer = readFileSync('./config/private-key.pem');
  publicKey: Buffer = readFileSync('./config/public-key.pem');;

  constructor() {
  }

  async sign(user: User) {
    return new Promise<string>((resolve, reject) => {
      sign(
        {
          id: user.id,
          isAdmin: user.isAdmin,
        },
        this.privateKey,
        {
          algorithm: 'ES256',
          expiresIn: '7d',
        },
        (e, result) => {
          if (e) {
            reject(e);
          } else {
            resolve(result!);
          }
        },
      );
    });
  }

  async verify(token: string): Promise<AuthInfo> {
    return new Promise((resolve, reject) => {
      verify(
        token,
        this.publicKey,
        {
          algorithms: ['ES256'],
        },
        (e, result) => {
          if (e) {
            reject(e);
          } else {
            resolve(result! as AuthInfo);
          }
        },
      )
    })
  }
}

export type Authorize = (ctx: Context) => Promise<boolean> | boolean;

export const createAuthorize = (authorize: Authorize) => {
  return (_: any, __: any, ctx: Context) => authorize(ctx)
};

export const loginRequired = createAuthorize((ctx) => ctx.isLoggedIn);
