import React from 'react';

import { Result, Button } from 'antd';

export interface ErrorViewProps {
  message: string;
}

export const ErrorView: React.VFC<ErrorViewProps> = (props) => {
  const {
    message,
  } = props;

  return (
    <Result
      status="500"
      title="500"
      subTitle={message}
      extra={(
        <Button
          type="primary"
          shape="round"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      )}
    />
  );
};
