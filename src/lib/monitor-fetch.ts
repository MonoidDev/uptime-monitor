import AbortController from 'abort-controller';
import fetch, { Headers } from 'node-fetch';

import http from 'http';
import https from 'https';
import tls from 'tls';

/* eslint-disable @typescript-eslint/lines-between-class-members */
class PingResult {
  timeout: boolean = false;
  tlsError: boolean = false;
  latency: number = 0;
  statusCode: number = 0;
  reqHeaders!: String[];
  resHeaders!: String[];
  resBody!: string;
}
/* eslint-enable @typescript-eslint/lines-between-class-members */

class TlsError extends Error {
  constructor(inner: Error) {
    super(inner.message);

    Object.setPrototypeOf(this, TlsError.prototype);
  }
}

function headersToStrings(i: Headers) {
  const o = new Array<String>();
  i.forEach((value, key) => {
    o.push(`${key}: ${value}`);
  });
  return o;
}

// A dummy httpAgent for node-fetch
const httpAgent = new http.Agent({
  keepAlive: false,
});

const httpsAgent = new https.Agent({
  keepAlive: false,
  checkServerIdentity: function(host, cert) {
    // Make sure the certificate is issued to the host we are connected to
    const err = tls.checkServerIdentity(host, cert);
    if (err) {
      return new TlsError(err);
    }
  }
});

async function doPing(url: string): Promise<PingResult> {
  const result = new PingResult();

  if (process.env.NODE_ENV !== 'production') {
    // mock
    console.info(`[fetch] mock for ${url}`);

    result.timeout = false;
    result.tlsError = false;
    result.latency = 100;
    result.statusCode = 200;
    result.reqHeaders = [
      'User-Agent: mock',
    ];
    result.resHeaders = [
      'Content-Length: 0',
    ];
    result.resBody = 'MOCK!!!';
    return result;
  }

  const reqHeadersDefault: { [key: string]: string } = {
    'Accept-Encoding': 'gzip,deflate,br',
    'Accept': '*/*',
    'Connection': 'close',
    'Transfer-Encoding': 'chunked',
    'User-Agent': 'node-fetch',
  };
  const reqHeaders = new Headers();
  Object.keys(reqHeadersDefault).forEach((key) => reqHeaders.set(key, reqHeadersDefault[key]));
  result.reqHeaders = headersToStrings(reqHeaders);

  const startAt = new Date();

  const controller = new AbortController();
  let timeout = false;
  const hTimeout = setTimeout(() => {
    timeout = true;
    controller.abort();
  }, 5000);

  // console.log(`[doPing] pinging ${url}`);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers: reqHeaders,
      agent: function(parsedUrl) {
        if (parsedUrl.protocol == 'https:') {
          return httpsAgent;
        } else {
          return httpAgent;
        }
      }
    });

    result.statusCode = response.status;
    result.resHeaders = headersToStrings(response.headers);
    result.resBody = await response.text();
  } catch (error: unknown) {
    if (error instanceof TlsError) {
      result.tlsError = true;
      // result.resBody = (error as Error).message;
    } else if (timeout) {
      result.timeout = true;
    } else {
      result.resBody = (error as Error).message;
    }
  } finally {
    clearTimeout(hTimeout);
  }

  const endAt = new Date();
  result.latency = endAt.getTime() - startAt.getTime();

  // console.log(`[doPing] pinged ${url} in ${result.latency}ms.`);
  return result;
}

export {
  doPing,
  PingResult,
};
