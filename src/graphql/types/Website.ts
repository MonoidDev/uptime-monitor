import humanizeDuration from 'humanize-duration';
import {
  objectType, inputObjectType, nonNull, enumType,
} from 'nexus';

import { SeverityType } from './Event';

export const WebsiteStatusType = enumType({
  name: 'WebsiteStatusType',
  members: ['UNKNOWN', 'OK', 'ERROR'],
});

export const Website = objectType({
  name: 'Website',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.url();
    t.model.pingInterval();
    t.model.enabled();
    t.model.userId();
    t.model.emails();
    t.model.errorPredicate();
    t.model.createdAt();
    t.list.field('status', {
      type: nonNull(WebsiteStatusType),
    });
    t.model.httpsCertExpiredAt();
    t.nonNull.field('sslMessage', {
      type: objectType({
        name: 'SSLMessage',
        definition(t2) {
          t2.field('severity', {
            type: nonNull(SeverityType),
          });
          t2.nonNull.string('message');
        },
      }),
      resolve(source) {
        if (source.url.startsWith('https://')) {
          if (source.httpsCertExpiredAt == null) {
            return {
              severity: 'INFO',
              message: 'SSL expiration is unknown. ',
            };
          }

          const duration = source.httpsCertExpiredAt.getTime() - Date.now();
          const humanized = humanizeDuration(duration, {
            units: ['y', 'mo', 'w', 'd', 'h'],
            round: true,
          });

          if (duration > 0 && duration < 7 * 24 * 3600 * 1000) {
            return {
              severity: 'WARN',
              message: `SSL is expiring in ${humanized}. `,
            };
          }

          if (duration <= 0) {
            return {
              severity: 'ERROR',
              message: `SSL has expired at ${source.httpsCertExpiredAt.toUTCString()}`,
            };
          }

          return {
            severity: 'LOG',
            message: `SSL is valid until ${source.httpsCertExpiredAt.toDateString()}`,
          };
        }
        return {
          severity: 'LOG',
          message: 'No SSL is configured for this website. ',
        };
      },
    });
  },
});

export const PaginatedWebsite = objectType({
  name: 'PaginatedWebsite',
  definition(t) {
    t.nonNull.int('count');
    t.nonNull.list.field('results', {
      type: nonNull('Website'),
    });
  },
});

export const CreateUpdateWebsite = inputObjectType({
  name: 'CreateUpdateWebsite',
  definition(t) {
    t.nonNull.string('name');
    t.nonNull.string('url');
    t.nonNull.int('pingInterval');
    t.nonNull.boolean('enabled');
    t.nonNull.string('errorPredicate');
    t.nonNull.list.field('emails', {
      type: nonNull('String'),
    });
  },
});
