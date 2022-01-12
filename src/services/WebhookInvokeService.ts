import { Website } from '@prisma/client';
import { CreateWebhookSchema } from 'app/graphql/types/WebhookSchema';
import { TimeoutError } from 'app/utils/errors';
import { WebhookResult } from 'graphql/client/generated';
import * as t from 'io-ts';
import fetch from 'node-fetch';

export class WebhookInvokeService {
  getWebhookWebsiteAlertBody(type: string, website: Website) {
    const url = `${process.env.NEXT_PUBLIC_SERVER}/monitoring/websiteStatus/${website.id}`;

    switch (type) {
      case 'Lark':
        return JSON.stringify({
          msg_type: 'post',
          content: {
            post: {
              en_us: {
                title: `${website.name} is DOWN!`,
                content: [
                  [
                    {
                      tag: 'text',
                      text: 'Your website ',
                    },
                    {
                      tag: 'a',
                      text: website.name,
                      href: website.url,
                    },
                    {
                      tag: 'text',
                      text: ' has just responded with error.',
                    },
                  ],
                  [
                    {
                      tag: 'a',
                      text: 'For more details...',
                      href: url,
                    },
                  ],
                ],
              },
            },
          },
        });

      case 'Slack':
        return JSON.stringify({
          text: `${website.name} is DOWN!`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `
*${website.name} is DOWN!*
Your website <${website.url}|${website.name}> has just responded with error.
For more details: <${url}|${website.name}>
                `.trim(),
              },
            },
          ],
        });
      default:
        throw new TypeError(`Unknown webhook name: ${type}`);
    }
  }

  getWebhookPlaintextBody(type: string, plaintext: string) {
    switch (type) {
      case 'Lark':
        return JSON.stringify({
          msg_type: 'text',
          content: {
            text: plaintext,
          },
        });
      case 'Slack':
        return JSON.stringify({
          text: plaintext,
        });
      default:
        throw new TypeError(`Unknown webhook name: ${type}`);
    }
  }

  isWebhookSuccessful(type: string, response: string) {
    switch (type) {
      case 'Lark':
        return JSON.parse(response).StatusMessage === 'success';
      case 'Slack':
        return response === 'ok';
      default:
        throw new TypeError(`Unknown webhook name: ${type}`);
    }
  }

  async invokeWebhook(webhook: t.TypeOf<typeof CreateWebhookSchema>, body: string) {
    return await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body,
    });
  }

  async testWebhook(webhook: t.TypeOf<typeof CreateWebhookSchema>): Promise<WebhookResult> {
    const t0 = Date.now();

    try {
      const result = await Promise.race([
        this.invokeWebhook(webhook, this.getWebhookPlaintextBody(webhook.type, 'Hello World!')),
        new Promise<void>((_, reject) => setTimeout(() => reject(new TimeoutError()), 5000)),
      ]);

      if (result) {
        const text = await result.text();
        try {
          const success = result.ok && this.isWebhookSuccessful(webhook.type, text);

          return {
            success,
            status: result.status,
            body: text,
            message: success ? 'Webhook called successfully. ' : 'Webhook called unsuccessfully. ',
            duration: Date.now() - t0,
          };
        } catch (e) {
          if (e instanceof SyntaxError) {
            return {
              success: false,
              status: result.status,
              body: text,
              message: e.message,
              duration: Date.now() - t0,
            };
          }
        }
      }

      throw new Error('Expect truthy result. ');
    } catch (e) {
      if (e instanceof TimeoutError) {
        return {
          success: false,
          status: 0,
          body: '',
          message: 'The request timed out. ',
          duration: Date.now() - t0,
        };
      }
      throw e;
    }
  }
}
