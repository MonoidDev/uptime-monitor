import React from 'react';

import {
  Form, Input, Button, Typography, Row, Col,
} from 'antd';

import { Layout } from '../../components/Layout';
import { LoginSchema } from '../../graphql/types/UserSchema';
import { useValidation } from '../../utils/useValidation';

export default function Page() {
  const validation = useValidation({
    type: LoginSchema,
    initialValues: {
      email: '',
      inputPassword: '',
    },
    onSubmit: async (values) => {
      console.log(values);
    },
  });

  return (
    <Layout showSider={false}>
      <Form
        {...validation.form}
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 8,
        }}
      >
        <Row>
          <Col span={8} />
          <Typography.Title className="!text-primary-dark">
            Login
          </Typography.Title>
        </Row>

        <Form.Item
          {...validation.item('email')}
        >
          <Input />
        </Form.Item>

        <Form.Item
          {...validation.item('inputPassword')}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
          }}
        >
          <Button type="primary" htmlType="submit" shape="round">
            Login
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
}
