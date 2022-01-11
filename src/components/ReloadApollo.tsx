import React from 'react';

import { ReloadOutlined } from '@ant-design/icons';
import { useApolloClient } from '@apollo/client';
import classNames from 'classnames';
import useAsyncFn from 'react-use/lib/useAsyncFn';

export const ReloadApollo: React.VFC<React.ComponentProps<typeof ReloadOutlined>> = (props) => {
  const queryClient = useApolloClient();

  const { className, ...rest } = props;

  const [refetchState, refetch] = useAsyncFn(() =>
    queryClient.refetchQueries({
      include: 'active',
    }),
  );

  return (
    <ReloadOutlined
      className={classNames('cursor-pointer', className)}
      spin={refetchState.loading}
      onClick={refetch}
      {...rest}
    />
  );
};
