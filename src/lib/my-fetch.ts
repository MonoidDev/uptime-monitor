import AbortController from 'abort-controller';
import fetch, { Headers } from 'node-fetch';

/* eslint-disable @typescript-eslint/lines-between-class-members */
class PingResult {
  timeout: boolean = false;
  latency: number = 0;
  statusCode: number = 0;
  reqHeaders!: String[];
  resHeaders!: String[];
  resBody!: string;
}
/* eslint-enable @typescript-eslint/lines-between-class-members */

function headersToStrings(i: Headers) {
  const o = new Array<String>();
  i.forEach((value, key) => {
    o.push(`${key}: ${value}`);
  });
  return o;
}

async function doPing(url: string): Promise<PingResult> {
  const result = new PingResult();

  if (process.env.NODE_ENV !== 'production')
  {
    // mock
    console.log(`[fetch] mock for ${url}`);

    result.timeout = false;
    result.latency = 100;
    result.statusCode = 200;
    result.reqHeaders = [
      'User-Agent: mock',
    ];
    result.resHeaders = [
      'Content-Length: 0',
    ];
    result.resBody = "MOCK";
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
    controller.abort();
    timeout = true;
  }, 5000);

  // console.log(`[doPing] pinging ${url}`);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers: reqHeaders,
    });

    result.statusCode = response.status;
    result.resHeaders = headersToStrings(response.headers);
    result.resBody = await response.text();
  } catch (error: unknown) {
    if (timeout) {
      result.timeout = true;
    } else {
      result.statusCode = -1;
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
