export interface WebhookDefinition {
  name: string;
  baseUrl: string;
}

export const webhookDefinitions: WebhookDefinition[] = [
  {
    name: 'Lark',
    baseUrl: 'https://open.larksuite.com/open-apis/bot/v2/hook/',
  },
  {
    name: 'Slack',
    baseUrl: 'https://hooks.slack.com/services/',
  },
];
