import { EmailService } from 'app/services/EmailService';
import { MonitorService } from 'app/services/MonitorService';
import { WebhookInvokeService } from 'app/services/WebhookInvokeService';
import debug from 'debug';

import { MonitorPlugin } from '../MonitorPlugin';

const sslDebug = debug('monitor:ssl');

export const sslPlugin = (): MonitorPlugin => {
  const monitorService = new MonitorService();

  const emailService = new EmailService();
  const webhookInvokeService = new WebhookInvokeService();
  return {
    name: 'event',
    async onTraceFetched(website, lastTrace, currentTrace, pingResult) {
      if (pingResult.tlsExpiredAt) {
        const isExpiring = pingResult.tlsExpiredAt - Date.now() <= 7 * 24 * 3600 * 1000;
        const shouldAlert = website.httpsCertExpireAlerted === false && isExpiring;

        if (shouldAlert) {
          for (const email of website.emails) {
            try {
              sslDebug(`sending email ${website.url} because its ssl is expring`);
              await emailService.sendWebsiteHttpsExpireAlert(
                website,
                new Date(pingResult.tlsExpiredAt),
                email,
              );
            } catch (e) {
              console.warn(e);
            }
          }

          for (const webhook of website.webhooks) {
            try {
              sslDebug(
                `calling webhook ${webhook.name} of ${website.url} because its ssl is expring`,
              );
              await webhookInvokeService.invokeWebhook(
                webhook,
                webhookInvokeService.getWebhookWebsiteHttpsExpireBody(
                  webhook.type,
                  website,
                  new Date(pingResult.tlsExpiredAt),
                ),
              );
            } catch (e) {
              console.warn(e);
            }
          }

          await monitorService.updateWebsiteHttpsCertExpireAlerted(website.id, true);
        } else if (
          website.httpsCertExpiredAt == null ||
          pingResult.tlsExpiredAt !== website.httpsCertExpiredAt.getTime()
        ) {
          await monitorService.updateWebsiteHttpsCertExpireAlerted(website.id, false);
        }

        await monitorService.updateWebsiteHttpsCertExpiredAt(website.id, pingResult.tlsExpiredAt);
      }
    },
  };
};
