import http from 'http';
import https from 'https';

import AbortController from 'abort-controller';
import fetch, { FetchError, Headers } from 'node-fetch';
// @ts-expect-error
import SslRootCAs from 'ssl-root-cas';

import { TraceStatus } from '.prisma/client';

/* eslint-disable @typescript-eslint/lines-between-class-members */
class PingResult {
  traceStatus?: TraceStatus;
  errorCode?: number;
  latency: number = 0;
  statusCode?: number;
  reqHeaders: String[] = [];
  resHeaders?: String[];
  resBody?: string;
}
/* eslint-enable @typescript-eslint/lines-between-class-members */

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

const rootCAs = SslRootCAs.create();
rootCAs.addFile(require.resolve('node_extra_ca_certs_mozilla_bundle/ca_bundle/ca_intermediate_bundle.pem'));
rootCAs.addFile(require.resolve('node_extra_ca_certs_mozilla_bundle/ca_bundle/ca_intermediate_root_bundle.pem'));
rootCAs.addFile(require.resolve('node_extra_ca_certs_mozilla_bundle/ca_bundle/ca_root_bundle.pem'));
// https.globalAgent.options.ca = rootCAs;

const httpsAgent = new https.Agent({
  keepAlive: false,
  rejectUnauthorized: true,
  ca: rootCAs,
});

// see: https://nodejs.org/api/errors.html#errors_common_system_errors
const ioErrors = [
  'ECONNREFUSED',
  'ECONNRESET',
  'EPIPE',
  'ETIMEDOUT',
];

// see: https://nodejs.org/api/errors.html#errors_common_system_errors
const dnsErrors = [
  'ENOTFOUND',
];

// see: https://nodejs.org/api/tls.html#tls_x509_certificate_error_codes
const sslErrors = [
  'UNABLE_TO_GET_ISSUER_CERT',
  'UNABLE_TO_GET_CRL',
  'UNABLE_TO_DECRYPT_CERT_SIGNATURE',
  'UNABLE_TO_DECRYPT_CRL_SIGNATURE',
  'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY',
  'CERT_SIGNATURE_FAILURE',
  'CRL_SIGNATURE_FAILURE',
  'CERT_NOT_YET_VALID',
  'CERT_HAS_EXPIRED',
  'CRL_NOT_YET_VALID',
  'CRL_HAS_EXPIRED',
  'ERROR_IN_CERT_NOT_BEFORE_FIELD',
  'ERROR_IN_CERT_NOT_AFTER_FIELD',
  'ERROR_IN_CRL_LAST_UPDATE_FIELD',
  'ERROR_IN_CRL_NEXT_UPDATE_FIELD',
  // 'OUT_OF_MEM',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'CERT_CHAIN_TOO_LONG',
  'CERT_REVOKED',
  'INVALID_CA',
  'PATH_LENGTH_EXCEEDED',
  'INVALID_PURPOSE',
  'CERT_UNTRUSTED',
  'CERT_REJECTED',
  'HOSTNAME_MISMATCH',
];

async function doPing(url: string): Promise<PingResult> {
  const result = new PingResult();

  if (process.env.NODE_ENV !== 'production' && process.env.FETCH_MOCK !== 'false') {
    // mock
    console.info(`[fetch] mock for ${url}`);

    result.traceStatus = TraceStatus.OK;
    result.errorCode = undefined;
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
      agent: (parsedUrl) => {
        if (parsedUrl.protocol === 'https:') {
          return httpsAgent;
        }
        return httpAgent;
      },
    });

    result.statusCode = response.status;
    if (result.statusCode >= 200 && result.statusCode < 300) {
      result.traceStatus = TraceStatus.OK;
    } else {
      result.traceStatus = TraceStatus.HTTP_ERROR;
    }
    result.resHeaders = headersToStrings(response.headers);
    result.resBody = await response.text();
  } catch (error: unknown) {
    result.traceStatus = TraceStatus.INTERNAL_ERROR;
    result.resBody = (error as Error).message;
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }

    if (timeout) {
      result.traceStatus = TraceStatus.TIMEOUT;
      result.resBody = '';
    } else if (error instanceof FetchError) {
      if (error.code) {
        if (ioErrors.includes(error.code)) {
          result.traceStatus = TraceStatus.IO_ERROR;
        } else if (dnsErrors.includes(error.code)) {
          result.traceStatus = TraceStatus.DNS_ERROR;
        } else if (sslErrors.includes(error.code)) {
          result.traceStatus = TraceStatus.SSL_ERROR;
        }
      }
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
