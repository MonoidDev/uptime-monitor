/* eslint-disable no-alert */
import React, { useMemo } from 'react';

import { MinusCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  message,
  Typography,
  Button,
  Form,
  Input,
  Switch,
  Row,
  Col,
  Alert,
  InputNumber,
  Radio,
  Space,
} from 'antd';
import { url } from 'app/../.next-urls';
import { mapErrorPredicateExplanation } from 'app/data/websites';
import { usePageQuery } from 'app/hooks/usePageQuery';
import {
  useUpdateWebsiteMutation, useGetWebsiteByIdQuery, useDeleteWebsiteMutation, ErrorPredicate,
} from 'graphql/client/generated';
import * as t from 'io-ts';
import { useRouter } from 'next/router';
import sleep from 'sleep-promise';
import * as h from 'tyrann-io';

import { Layout } from '../../../components/Layout';
import { CreateUpdateWebsiteSchema } from '../../../graphql/types/WebsiteSchema';
import { useValidation } from '../../../hooks/useValidation';

export default function Page() {
  const router = useRouter();

  const { id } = usePageQuery(
    useMemo(() => t.type({
      id: h.number().castString(),
    }), []),
  );

  const websiteDetails = useGetWebsiteByIdQuery({
    variables: {
      id,
    },
  });

  const websiteDetailsData = {
    name: websiteDetails.data?.website?.name ?? '',
    url: websiteDetails.data?.website?.url ?? '',
    pingInterval: websiteDetails.data?.website?.pingInterval ?? 600,
    enabled: websiteDetails.data?.website?.enabled ?? false,
    emails: websiteDetails.data?.website?.emails ?? [],
    errorPredicate: websiteDetails.data?.website?.errorPredicate ?? ErrorPredicate.Http_2XxOnly,
  };

  const [updateWebsite, { error }] = useUpdateWebsiteMutation();

  const [deleteWebsite] = useDeleteWebsiteMutation();

  const validation = useValidation({
    type: CreateUpdateWebsiteSchema,
    error,
    initialValues: websiteDetailsData,
    onSubmit: async (website) => {
      await updateWebsite({
        variables: {
          websiteId: id,
          website,
        },
      });
      message.success(`Successfully modified site ${website.name}`);

      await sleep(1000);
      router.push(url('/monitoring/websites'));
    },
  });

  const onDeleteWebsite = async () => {
    if (!window.confirm(`Do you really want to delete ${websiteDetailsData.name}? All related data will be deleted and cannnot be reversed. `)) {
      return;
    }

    await deleteWebsite({
      variables: {
        websiteId: id,
      },
    });

    message.success(`Successfully deleted site ${websiteDetailsData.name}`);

    await sleep(1000);
    router.push(url('/monitoring/websites'));
  };

  const renderTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <Typography.Title className="!text-primary-dark">
          Modify Website
        </Typography.Title>
      </div>
    );
  };

  return (
    <Layout
      breadcrumb={[
        {
          title: 'Monitoring',
          href: '/monitoring/websites',
        },
        {
          title: 'Websites',
          href: '/monitoring/websites',
        },
        {
          title: String(id),
        },
      ]}
      queries={[
        websiteDetails,
      ]}
    >
      {renderTitle()}
      <div className="bg-white p-8 shadow-md">
        <Form
          {...validation.form}
          {...formItemLayout}
          name="websiteSearch"
        >
          <Row>
            <Col span={8} />
            {validation.serverError.messages?.map((m, i) => (
              <Alert key={i} message={m} type="error" showIcon />
            ))}
          </Row>
          <Form.Item
            {...validation.item('name')}
            required
          >
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item
            {...validation.item('url')}
            required
          >
            <Input placeholder="URL" />
          </Form.Item>
          <Form.Item
            {...validation.item('pingInterval')}
            required
            label="Ping Interval"
          >
            <InputNumber placeholder="Ping Interval" className="w-full" />
          </Form.Item>
          <Form.Item
            {...validation.item('enabled')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.List
            {...validation.item('emails')}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    {...(index === 0 ? formListItemLayout : formListItemLayoutWithOutLabel)}
                    label={index === 0 ? 'Emails' : ''}
                    required={false}
                    key={field.key}
                  >
                    <Form.Item
                      {...field}
                      noStyle
                    >
                      <Input placeholder="Email" className="w-4/5" />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined
                        onClick={() => remove(field.name)}
                        className="relative mx-1"
                      />
                    ) : null}
                  </Form.Item>
                ))}
                <Form.Item {...formListItemLayoutWithOutLabel}>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="w-4/5"
                  >
                    Add email
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            {...validation.item('errorPredicate')}
            required
          >
            <Radio.Group className="py-1">
              <Space direction="vertical">
                {Object.values(ErrorPredicate).map((e) => (
                  <Radio value={e} key={e}>
                    <span>
                      {e}
                    </span>
                    <br />
                    <span className="text-gray-500">
                      {mapErrorPredicateExplanation(e)}
                    </span>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              shape="round"
              htmlType="submit"
            >
              Modify
            </Button>
            <Button
              type="primary"
              shape="round"
              icon={<DeleteOutlined className="align-text-top" />}
              htmlType="button"
              className="ml-5 bg-white border-primary text-primary"
              onClick={onDeleteWebsite}
            >
              Delete
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
}

const formItemLayout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 8,
  },
};

const formListItemLayout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 10,
  },
};

const formListItemLayoutWithOutLabel = {
  wrapperCol: {
    span: 10,
    offset: 3,
  },
};

export const getServerSideProps = () => ({
  props: {},
});
