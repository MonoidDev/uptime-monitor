import { Webhook, Website } from '@prisma/client';
import { WebhookInvokeService } from 'app/services/WebhookInvokeService';

(async () => {
  const webhookInvokeService = new WebhookInvokeService();

  // const larkWebhook: Webhook = {
  //   id: 1,
  //   name: 'Test Lark',
  //   type: 'Lark',
  //   url: 'https://open.larksuite.com/open-apis/bot/v2/hook/19100896-50a6-4177-8827-0843199de5fe',
  //   userId: 2,
  // };

  const slackWebhook: Webhook = {
    id: 1,
    name: 'Test Slack',
    type: 'Slack',
    url: 'https://hooks.slack.com/services/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',
    userId: 2,
  };

  const website: Website = {
    id: 1,
    name: 'Google',
    url: 'https://wwww.google.com',
    pingInterval: 1000,
    enabled: true,
    userId: 1,
    emails: [],
    errorPredicate: 'HTTP_2XX_ONLY',
    httpsCertExpiredAt: null,
    httpsCertExpireAlerted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const response = await webhookInvokeService.invokeWebhook(
    slackWebhook,
    webhookInvokeService.getWebhookWebsiteAlertBody(slackWebhook.type, website)!,
  );

  console.info(await response.text());
})();
