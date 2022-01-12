import React, { useMemo, useRef } from 'react';

import useSearch from '@monoid-dev/use-search';
import { Typography, Button, Form, Input, Row, Col, Alert, Select } from 'antd';
import { Layout } from 'app/components/Layout';
import { webhookDefinitions } from 'app/data/webhooks';
import { CreateWebhookSchema } from 'app/graphql/types/WebhookSchema';
import { useValidation } from 'app/hooks/useValidation';
import {
  useCreateWebhookMutation,
  useDeleteWebhookMutation,
  useTestWebhookMutation,
  useUpdateWebhookMutation,
  useWebhookQuery,
  WebhookResult,
} from 'graphql/client/generated';
import * as t from 'io-ts';
import Image from 'next/image';
import { useRouter } from 'next/router';
import * as h from 'tyrann-io';

import { url } from '.next-urls';

interface WebhookResultDisplayProps {
  item: WebhookResult;
}

const WebhookResultDisplay: React.VFC<WebhookResultDisplayProps> = (props) => {
  const { item } = props;

  const renderRow = (
    label: React.ReactNode,
    value: React.ReactNode,
    multiline: boolean = false,
  ) => {
    return (
      <>
        <Col className="gutter-row" span={multiline ? 24 : 8}>
          <div className="text-gray-400">{label}</div>
        </Col>
        <Col className="gutter-row" span={multiline ? 24 : 16}>
          <div className="text-gray-700 whitespace-pre overflow-scroll max-h-24">{value}</div>
        </Col>
      </>
    );
  };

  return (
    <div className="bg-gray-100 p-4">
      <Row gutter={[16, 8]}>
        <Col className={item.success ? 'text-green-400' : 'text-red-500'} span={24}>
          {item.message}
        </Col>

        {renderRow('Status', item.status)}

        {renderRow(
          'Duration',
          <span className={item.duration > 1000 ? 'text-yellow-300' : ''}>
            {item.duration}
            ms
          </span>,
        )}

        {renderRow('Body', item.body, true)}
      </Row>
    </div>
  );
};

export default function Page() {
  const { search } = useSearch(
    useMemo(
      () =>
        t.type({
          editId: h.omittable(h.number().cast()),
        }),
      [],
    ),
  );

  const router = useRouter();

  const submitTypeRef = useRef<'submit' | 'test' | 'delete'>('submit');

  const webhook = useWebhookQuery({
    skip: search?.editId === undefined,
    variables: {
      webhookId: search?.editId!,
    },
  });

  const [updateWebhook, updateWebhookResult] = useUpdateWebhookMutation();
  const [createWebhook, createWebhookResult] = useCreateWebhookMutation();
  const [deleteWebhook, deleteWebhookResult] = useDeleteWebhookMutation();

  const [testWebhook, testWebhookResult] = useTestWebhookMutation();

  const data = webhook.data?.webhook;

  const validation = useValidation({
    initialValues: {
      name: data?.name ?? '',
      type: data?.type ?? '',
      url: data?.url ?? '',
    },
    type: CreateWebhookSchema,
    error: undefined,
    onSubmit: async (webhook) => {
      switch (submitTypeRef.current) {
        case 'submit':
          if (search?.editId === undefined) {
            await createWebhook({
              variables: {
                webhook,
              },
            });
          } else {
            await updateWebhook({
              variables: {
                webhookId: search.editId!,
                webhook,
              },
            });
          }

          router.push(url('/integrations/webhooks'));
          break;
        case 'test':
          await testWebhook({
            variables: {
              webhook,
            },
          });
          break;
        case 'delete':
          await deleteWebhook({
            variables: {
              webhookId: search?.editId!,
            },
          });

          router.push(url('/integrations/webhooks'));
          break;
      }
    },
  });

  const renderTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <Typography.Title className="!text-primary-dark">
          {search?.editId ? 'Edit Webhook' : 'Add Webhook'}
        </Typography.Title>
      </div>
    );
  };

  const formItemLayout = {
    labelCol: {
      span: 3,
    },
    wrapperCol: {
      span: 8,
    },
  };

  return (
    <Layout
      breadcrumb={[
        {
          title: 'Integrations',
          href: '/integrations/webhooks',
        },
        {
          title: 'Webhooks',
          href: '/integrations/webhooks',
        },
        {
          title: search?.editId ? 'Edit' : 'Add',
        },
      ]}
      queries={[search?.editId != null && webhook]}
    >
      {renderTitle()}
      <div className="bg-white p-8 shadow-md">
        <Form {...validation.form} {...formItemLayout} name="websiteSearch">
          <Row>
            <Col span={8} />
            {validation.serverError.messages?.map((m, i) => (
              <Alert key={i} message={m} type="error" showIcon />
            ))}
          </Row>
          <Form.Item {...validation.item('name')} required>
            <Input placeholder="A friendly name of your Webhook" />
          </Form.Item>

          <Form.Item {...validation.item('type')} required>
            <Select>
              {webhookDefinitions.map((def) => (
                <Select.Option key={def.type} value={def.type}>
                  <div>
                    <span className="mr-2 relative top-[2px]">
                      <Image src={def.icon} height={16} width={16} />
                    </span>
                    {def.type}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item {...validation.item('url')} required>
            <Input placeholder="Webhook API endpoint" />
          </Form.Item>

          {testWebhookResult.data?.testWebhook && (
            <Form.Item label="Test Result">
              <WebhookResultDisplay item={testWebhookResult.data.testWebhook} />
            </Form.Item>
          )}

          <div className="h-4" />

          <Form.Item>
            <Button
              type="primary"
              shape="round"
              htmlType="submit"
              loading={search?.editId ? updateWebhookResult.loading : createWebhookResult.loading}
              onClick={() => (submitTypeRef.current = 'submit')}
            >
              {search?.editId ? 'Edit' : 'Add'}
            </Button>

            <Button
              className="ml-6"
              shape="round"
              htmlType="submit"
              loading={testWebhookResult.loading}
              onClick={() => (submitTypeRef.current = 'test')}
            >
              Test
            </Button>

            {search?.editId && (
              <Button
                className="ml-6"
                type="primary"
                // icon={<DeleteOutlined className="align-text-top" />}
                shape="round"
                htmlType="submit"
                loading={deleteWebhookResult.loading}
                onClick={() => (submitTypeRef.current = 'delete')}
              >
                {'Delete'}
              </Button>
            )}
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
}

export const getServerSideProps = () => ({
  props: {},
});
