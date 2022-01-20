import { TraceStatus } from '@prisma/client';
import { EmailService } from 'app/services/EmailService';
import debug from 'debug';

import { MonitorPlugin } from '../MonitorPlugin';

const emailDebug = debug('monitor:email');

export const emailPlugin = (): MonitorPlugin => {
  const emailService = new EmailService();

  return {
    name: 'event',
    async onTraceFetched(website, lastTrace, currentTrace) {
      const failed = currentTrace.status !== TraceStatus.OK;

      if (failed && (lastTrace?.status === TraceStatus.OK || lastTrace == null)) {
        emailDebug(`sending email ${website.url} because it becomes not available`);
        for (const email of website.emails) {
          try {
            await emailService.sendWebsiteAlert(website, email);
          } catch (e) {
            console.error(e);
          }
        }
        return;
      }
    },
  };
};
