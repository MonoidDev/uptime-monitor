import React from 'react';

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Typography,
  Button,
  Form,
  Input,
  Switch,
  Row,
  Col,
  Alert,
  InputNumber,
  message,
  Radio,
  Space,
} from 'antd';
import { url } from 'app/../.next-urls';
import { Layout } from 'app/components/Layout';
import { mapErrorPredicateExplanation } from 'app/data/websites';
import { CreateUpdateWebsiteSchema } from 'app/graphql/types/WebsiteSchema';
import { useValidation } from 'app/hooks/useValidation';
import { ErrorPredicate, useCreateWebsiteMutation } from 'graphql/client/generated';
import { useRouter } from 'next/router';
import sleep from 'sleep-promise';

export default function Page() {
  const router = useRouter();

  const [createWebsite, { error, loading }] = useCreateWebsiteMutation();

  const validation = useValidation({
    initialValues: {
      name: '',
      url: '',
      pingInterval: 600,
      enabled: true,
      emails: [],
      errorPredicate: '',
    },
    type: CreateUpdateWebsiteSchema,
    error,
    onSubmit: async (website) => {
      const response = await createWebsite({
        variables: {
          website,
        },
      });

      message.success(`Successfully added site ${response.data?.createWebsite?.name}`);

      await sleep(1000);
      router.push(url('/monitoring/websites'));
    },
  });

  const renderTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <Typography.Title className="!text-primary-dark">
          Add Website
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
          title: 'Add',
        },
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
                  <Radio value={e}>
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
              loading={loading}
            >
              Add
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
