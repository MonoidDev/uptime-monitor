import React from 'react';

import Link from 'next/link';

import { urls } from '../../.next-urls';

export default function Page() {
  return (
    <>
      <ul className="p-6">
        {urls.map((url) => (
          <li key={url}>
            <Link href={url}>
              <a>{url}</a>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
