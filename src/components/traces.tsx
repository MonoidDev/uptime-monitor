import React from 'react';

import { Button, Modal } from 'antd';
import { useGetTraceByIdQuery } from 'app/../graphql/client/generated';
import { traceStatusToColor } from 'app/data/traces';
import { dynamicUrl } from 'app/utils/types';
import dayjs from 'dayjs';

import { QueryContainer } from './QueryContainer';
import { TraceDataCell } from './TraceDataCell';

export interface TraceDataModalProps {
  visible: boolean;
  onClose: () => void;
  id?: number;
}

export const TraceDataModal: React.VFC<TraceDataModalProps> = (props) => {
  const { visible, onClose, id } = props;

  const trace = useGetTraceByIdQuery({
    variables: {
      id: id!,
    },
    skip: id === undefined,
  });

  const traceData = trace.data?.trace;

  return (
    <Modal
      title={`Trace #${id}`}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <QueryContainer queries={[trace]} className="h-96">
        {() => (
          <>
            <TraceDataCell label="Type">{traceData?.traceType}</TraceDataCell>
            <TraceDataCell label="Website">
              <a
                className="underline"
                href={dynamicUrl('/monitoring/websites/[id]', {
                  id: traceData?.website.id!,
                })}
              >
                {traceData?.website.name}
              </a>
            </TraceDataCell>
            <TraceDataCell label="URL">
              <a
                className="underline"
                href={traceData?.website.url}
                target="_blank"
                rel="noreferrer"
              >
                {traceData?.website.url}
              </a>
            </TraceDataCell>
            <TraceDataCell label="Time">
              {traceData?.createdAt && dayjs(traceData?.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </TraceDataCell>
            <TraceDataCell label="Status" className={traceStatusToColor[traceData?.status!]}>
              {traceData?.status}
            </TraceDataCell>
            <TraceDataCell label="Duration">{traceData?.duration}</TraceDataCell>
            <TraceDataCell label="HTTP Status Code">{traceData?.httpStatusCode}</TraceDataCell>
            <TraceDataCell label="Request Headers" multilines>
              {traceData?.requestHeaders}
            </TraceDataCell>
            <TraceDataCell label="Response Headers" multilines>
              {traceData?.responseHeaders}
            </TraceDataCell>
            <TraceDataCell label="Response Data" multilines>
              {traceData?.responseData}
            </TraceDataCell>
          </>
        )}
      </QueryContainer>
    </Modal>
  );
};
