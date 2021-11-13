import tls from 'tls';
import { URL } from 'url';

async function doTlsPing(rawUrl: string): Promise<tls.PeerCertificate | undefined> {
  const parsedUrl = new URL(rawUrl);
  let port = 443;
  if (parsedUrl.port !== '') {
    port = parseInt(parsedUrl.port, 10);
  }
  return new Promise((resolve, reject) => {
    let cert : tls.PeerCertificate | undefined;

    const socket = tls.connect({
      host: parsedUrl.host,
      port,
      servername: parsedUrl.host,
      rejectUnauthorized: false,
    });
    socket.on('secureConnect', () => {
      cert = socket.getPeerCertificate(false);
      socket.end();
    });
    socket.on('end', () => {
      resolve(cert);
    });
    socket.on('error', (err) => {
      reject(err);
    });
  });
}

export {
  doTlsPing,
};
