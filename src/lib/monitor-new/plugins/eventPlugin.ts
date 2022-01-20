import { WebsiteEventSource } from 'app/graphql/types/EventSchema';
import { EmailService } from 'app/services/EmailService';
import { MonitorService } from 'app/services/MonitorService';
import { WebhookInvokeService } from 'app/services/WebhookInvokeService';
import debug from 'debug';

import { MonitorPlugin } from '../MonitorPlugin';
import { getEventSourceByTrace } from './common';

const eventDebug = debug('monitor:event');

export const eventPlugin = (): MonitorPlugin => {
  const monitorService = new MonitorService();

  const emailService = new EmailService();
  const webhookInvokeService = new WebhookInvokeService();
  return {
    name: 'event',
    async onTraceFetched(website, lastTrace, currentTrace) {
      const source = getEventSourceByTrace(lastTrace, currentTrace);

      if (source) {
        eventDebug(`${website.url} becomes ${source}`);
        await monitorService.addEvent({
          source,
          website,
          trace: currentTrace,
        });

        if (source === WebsiteEventSource.NotAvailable) {
          for (const email of website.emails) {
            eventDebug(`sending email ${website.url} because it becomes not available`);

            try {
              await emailService.sendWebsiteAlert(website, email);
            } catch (e) {
              console.error(e);
            }
          }

          for (const webhook of website.webhooks) {
            eventDebug(
              `calling webhook ${webhook.name} of ${website.url} because it becomes not available`,
            );
            try {
              await webhookInvokeService.invokeWebhook(
                webhook,
                webhookInvokeService.getWebhookWebsiteAlertBody(webhook.type, website),
              );
            } catch (e) {
              console.error(e);
            }
          }
        }

        return;
      }
    },
  };
};
