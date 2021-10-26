import React from 'react';

import { WebsiteEventSource } from 'app/graphql/types/EventSchema';
import { url } from 'app/utils/types';
import Link from 'next/link';

const getLink = (websiteName: string, id: number) => {
  return (
    <Link
      href={url('/monitoring/websiteStatus/[id]').replace('[id]', String(id))}
    >
      {websiteName}
    </Link>
  );
};

export const websiteEventTypeToDescription: Record<WebsiteEventSource, (websiteName: string, id: number) => React.ReactNode> = {
  [WebsiteEventSource.HighLatency]: (websiteName: string, id: number) => (
    <>
      {getLink(websiteName, id)}
      {' '}
      responses with high latency.
    </>
  ),
  [WebsiteEventSource.NotAvailable]: (websiteName: string, id: number) => (
    <>
      {getLink(websiteName, id)}
      {' '}
      becomes not available.
    </>
  ),
  [WebsiteEventSource.Enabled]: (websiteName: string, id: number) => (
    <>
      {getLink(websiteName, id)}
      {' '}
      is enabled.
    </>
  ),
  [WebsiteEventSource.Disabled]: (websiteName: string, id: number) => (
    <>
      {getLink(websiteName, id)}
      {' '}
      is disabled.
    </>
  ),
  [WebsiteEventSource.Available]: (websiteName: string, id: number) => (
    <>
      {getLink(websiteName, id)}
      {' '}
      becomes available.
    </>
  ),
};
