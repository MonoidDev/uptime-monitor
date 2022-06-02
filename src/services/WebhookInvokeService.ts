import { Website } from '@prisma/client';
import { CreateWebhookSchema } from 'app/graphql/types/WebhookSchema';
import { TimeoutError } from 'app/utils/errors';
import { WebhookResult } from 'graphql/client/generated';
import humanizeDuration from 'humanize-duration';
import * as t from 'io-ts';
import fetch from 'node-fetch';

export class WebhookInvokeService {
  getWebsiteUrl(website: Website) {
    return `${process.env.NEXT_PUBLIC_SERVER}/monitoring/websiteStatus/${website.id}`;
  }

  getWebhookWebsiteHttpsExpireBody(type: string, website: Website, expiration: Date) {
    const url = this.getWebsiteUrl(website);

    const isExpired = expiration.getTime() < Date.now();
    const duration = humanizeDuration(expiration.getTime() - Date.now(), {
      units: ['y', 'mo', 'w', 'd', 'h'],
      round: true,
    });

    const title = isExpired
      ? `${website.name} SSL certificate has expired for ${duration}! `
      : `${website.name} SSL certificate is expiring in ${duration}!`;

    const prompt = `${isExpired ? 'has expired' : 'is expiring'} ${
      isExpired ? `for ${duration}` : `in ${duration}`
    } at ${expiration.toUTCString()}. Please update your certificate. `;

    switch (type) {
      case 'Lark':
        return JSON.stringify({
          msg_type: 'post',
          content: {
            post: {
              en_us: {
                title,
                content: [
                  [
                    {
                      tag: 'text',
                      text: 'The SSL certificate website for',
                    },
                    {
                      tag: 'a',
                      text: website.name,
                      href: website.url,
                    },
                    {
                      tag: 'text',
                      text: prompt,
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
          text: title,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `
*${title}*
The certificate website for <${website.url}|${website.name}> ${prompt}
For more details: <${url}|${website.name}>`.trim(),
              },
            },
          ],
        });
      default:
        throw new TypeError(`Unknown webhook name: ${type}`);
    }
  }

  getWebhookWebsiteAlertBody(type: string, website: Website) {
    const url = this.getWebsiteUrl(website);

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

  getWebhookWebsiteRecoverBody(type: string, website: Website) {
    const url = this.getWebsiteUrl(website);

    switch (type) {
      case 'Lark':
        return JSON.stringify({
          msg_type: 'post',
          content: {
            post: {
              en_us: {
                title: `${website.name} is UP!`,
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
                      text: ' is up.',
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
          text: `${website.name} is UP!`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `
*${website.name} is UP!*
Your website <${website.url}|${website.name}> is up.
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
