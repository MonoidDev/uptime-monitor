import { TraceStatus } from '@prisma/client';
import { WebhookInvokeService } from 'app/services/WebhookInvokeService';
import debug from 'debug';

import { MonitorPlugin } from '../MonitorPlugin';

const webhookDebug = debug('monitor:webhook');

export const webhookPlugin = (): MonitorPlugin => {
  const webhookInvokeService = new WebhookInvokeService();

  return {
    name: 'event',
    async onTraceFetched(website, lastTrace, currentTrace) {
      const failed = currentTrace.status !== TraceStatus.OK;

      if (failed && (lastTrace?.status === TraceStatus.OK || lastTrace == null)) {
        for (const webhook of website.webhooks) {
          webhookDebug(
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
        return;
      }
    },
  };
};
