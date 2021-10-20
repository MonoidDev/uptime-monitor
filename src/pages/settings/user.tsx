import React from 'react';

import {
  message,
  Alert,
  Button,
  Col,
  Form,
  Input,
  Row,
  Typography,
} from 'antd';
import { Layout } from 'app/components/Layout';
import { UpdateUserSchema } from 'app/graphql/types/UserSchema';
import { useValidation } from 'app/hooks/useValidation';
import { useMeQuery, useUpdateMeMutation } from 'graphql/client/generated';
import { useRouter } from 'next/router';
import sleep from 'sleep-promise';

export default function Page() {
  const me = useMeQuery();
  const router = useRouter();

  const [updateMe, { error, loading }] = useUpdateMeMutation();

  const validation = useValidation({
    type: UpdateUserSchema,
    error,
    initialValues: {
      email: me.data?.me?.email ?? '',
      name: me.data?.me?.name ?? '',
    },
    onSubmit: async (user) => {
      await updateMe({
        variables: {
          user,
        },
      });

      message.success('Successfully updated your profile! ');

      await sleep(1000);
      router.back();
    },
  });

  return (
    <Layout
      queries={[me]}
    >
      {() => (
        <Form
          {...validation.form}
        >
          <Row>
            {validation.serverError.messages?.map((m, i) => (
              <Alert key={i} message={m} type="error" showIcon />
            ))}
          </Row>

          <Row>
            <Typography.Title className="!text-primary-dark">
              Edit Profile
            </Typography.Title>
          </Row>

          <Row>
            <Col
              span={12}
            >
              <Form.Item
                {...validation.item('email')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                {...validation.item('name')}
              >
                <Input />
              </Form.Item>

              <Form.Item>
                <Button loading={loading} type="primary" htmlType="submit" shape="round">
                  Update
                </Button>
              </Form.Item>
            </Col>

            <Col span={12} />
          </Row>
        </Form>
      )}
    </Layout>
  );
}
