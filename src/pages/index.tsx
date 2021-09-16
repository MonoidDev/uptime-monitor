import React from 'react';

import { DatePicker } from 'antd';

import { useGetUserByIdQuery } from '../../graphql/client/generated';
import { Layout } from '../components/Layout';

export default function Page() {
  const userQuery = useGetUserByIdQuery({
    variables: {
      id: 2,
    },
  });

  return (
    <Layout>
      Hello,
      {' '}
      {userQuery.data?.user?.name}
      {' '}
      joined at
      {' '}
      {userQuery.data?.user?.createdAt}

      <DatePicker />
    </Layout>
  );
}
