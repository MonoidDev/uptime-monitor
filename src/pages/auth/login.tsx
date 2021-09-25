import React from 'react';

import {
  Form, Input, Button, Typography, Row, Col, Alert,
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useLoginMutation } from '../../../graphql/client/generated';
import { Layout } from '../../components/Layout';
import { LoginSchema } from '../../graphql/types/UserSchema';
import { useAuth } from '../../hooks/useAuth';
import { useValidation } from '../../hooks/useValidation';
import { url } from '../../utils/types';

export default function Page() {
  const [login, { error }] = useLoginMutation();
  const router = useRouter();

  const { dispatch } = useAuth();

  const validation = useValidation({
    type: LoginSchema,
    error,
    initialValues: {
      email: 'django@gmail.com',
      inputPassword: '123123123',
    },
    onSubmit: async (auth) => {
      const result = await login({
        variables: {
          auth,
        },
      });

      dispatch({
        type: 'login',
        token: result.data!.login!.token!,
      });

      router.replace(url('/'));
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
          <Link href={url('/auth/createUser')}>
            <a className="px-6 text-primary-dark">
              Register Now
            </a>
          </Link>
        </Form.Item>
      </Form>
    </Layout>
  );
}
