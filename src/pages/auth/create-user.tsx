import React from 'react';

import {
  Form, Input, Button, Typography, Row, Col, Alert,
} from 'antd';
import { useRouter } from 'next/router';

import { useCreateUserMutation } from '../../../graphql/client/generated';
import { Layout } from '../../components/Layout';
import { CreateUserSchema } from '../../graphql/types/UserSchema';
import { useValidation } from '../../hooks/useValidation';
import { url } from '../../utils/types';

export default function Page() {
  const [createUser, { error }] = useCreateUserMutation();
  const router = useRouter();

  const validation = useValidation({
    type: CreateUserSchema,
    error,
    initialValues: {
      email: 'django@gmail.com',
      inputPassword: '123123123',
    },
    onSubmit: async (user) => {
      await createUser({
        variables: {
          user,
        },
      });

      router.replace(url('/auth/login'));
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
          {validation.serverError.messages?.map((m, i) => (
            <Alert key={i} message={m} type="error" showIcon />
          ))}
        </Row>
        <Row>
          <Col span={8} />
          <Typography.Title className="!text-primary-dark">
            Create User
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
            Register
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
}
