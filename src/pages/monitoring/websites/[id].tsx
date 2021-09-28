import React, { useMemo } from 'react';

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
} from 'antd';
import { usePageQuery } from 'app/hooks/usePageQuery';
import { useUpdateWebsiteMutation, useGetWebsiteByIdQuery } from 'graphql/client/generated';
import * as t from 'io-ts';
import * as h from 'tyrann-io';

import { Layout } from '../../../components/Layout';
import { CreateUpdateWebsiteSchema } from '../../../graphql/types/WebsiteSchema';
import { useValidation } from '../../../hooks/useValidation';

export default function Page() {
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
    name: websiteDetails.data?.website?.name!,
    url: websiteDetails.data?.website?.url!,
    pingInterval: websiteDetails.data?.website?.pingInterval!,
    enabled: websiteDetails.data?.website?.enabled!,
    emails: websiteDetails.data?.website?.emails!,
  };

  const [updateWebsite, { error }] = useUpdateWebsiteMutation();

  const validation = useValidation({
    type: CreateUpdateWebsiteSchema,
    error,
    initialValues: websiteDetailsData,
    onSubmit: async (website) => {
      const response = await updateWebsite({
        variables: {
          websiteId: id,
          website,
        },
      });
      console.log(response);
    },
  });

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
              htmlType="button"
              className="ml-5 bg-red-600 border-red-600 hover:bg-red-500 hover:border-red-500"
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
