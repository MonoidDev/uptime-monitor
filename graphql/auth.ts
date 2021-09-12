import { User } from ".prisma/client";
import { readFileSync } from "fs";
import { sign, verify, Jwt } from 'jsonwebtoken';

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