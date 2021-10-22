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
import { UpdateUserPasswordSchema } from 'app/graphql/types/UserSchema';
import { useValidation } from 'app/hooks/useValidation';
import { useMeQuery, useUpdateMyPasswordMutation } from 'graphql/client/generated';
import { useRouter } from 'next/router';
import sleep from 'sleep-promise';

export default function Page() {
  const me = useMeQuery();
  const router = useRouter();

  const [updateMyPassword, { error, loading }] = useUpdateMyPasswordMutation();

  const validation = useValidation({
    type: UpdateUserPasswordSchema,
    error,
    initialValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordRepeated: '',
    },
    onSubmit: async (updatePassword) => {
      await updateMyPassword({
        variables: {
          updatePassword,
        },
      });

      message.success('Successfully updated your password! ');

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
          labelCol={{
            span: 6,
          }}
        >
          <Row>
            {validation.serverError.messages?.map((m, i) => (
              <Alert key={i} message={m} type="error" showIcon />
            ))}
          </Row>

          <Row>
            <Typography.Title className="!text-primary-dark">
              Change Password
            </Typography.Title>
          </Row>

          <Row>
            <Col
              span={12}
            >
              <Form.Item
                {...validation.item('currentPassword')}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                {...validation.item('newPassword')}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                {...validation.item('newPasswordRepeated')}
              >
                <Input.Password />
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
