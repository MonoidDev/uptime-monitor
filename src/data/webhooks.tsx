import larkIcon from 'app/assets/Lark.png';
import slackIcon from 'app/assets/Slack.png';

export interface WebhookDefinition {
  type: string;
  baseUrl: string;
  icon: StaticImageData;
}

export const webhookDefinitions: WebhookDefinition[] = [
  {
    type: 'Lark',
    baseUrl: 'https://open.larksuite.com/open-apis/bot/v2/hook/',
    icon: larkIcon,
  },
  {
    type: 'Slack',
    baseUrl: 'https://hooks.slack.com/services/',
    icon: slackIcon,
  },
];
