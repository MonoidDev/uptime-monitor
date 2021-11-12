import { gStyles } from 'app/styles';
import classNames from 'classnames';
import { SeverityType, SslMessage } from 'graphql/client/generated';

export interface SSLMessageProps {
  sslMessage: SslMessage
}

export const SSLMessage: React.VFC<SSLMessageProps> = (props: SSLMessageProps) => {
  const {
    sslMessage,
  } = props;

  const isSslMessageImportant = [
    SeverityType.Error,
    SeverityType.Fatal,
    SeverityType.Warn,
  ].includes(sslMessage.severity as any);

  return (
    <>
      <span className={classNames(gStyles.tag, gStyles[sslMessage.severity.toLowerCase()], 'mr-2')}>
        {sslMessage.severity.toLowerCase()}
      </span>
      <span className={classNames(isSslMessageImportant && 'text-red-600')}>
        {sslMessage.message}
      </span>
    </>
  );
};
