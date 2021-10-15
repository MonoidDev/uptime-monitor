import React, { useState } from 'react';

import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';

export interface DeleteButtonProps {
  onDelete: ()=>Promise<void>,
}

export const DeleteButton: React.FC<DeleteButtonProps> = (props) => {
  const {
    onDelete,
  } = props;

  const [visible, setVisible] = useState<boolean | undefined>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const onCancel = () => {
    setVisible(false);
  };

  const onConfirm = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setVisible(false);
      setConfirmLoading(false);
      onDelete();
    }, 1000);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popconfirm
        title="Are you sure to delete this site?"
        visible={visible}
        onConfirm={onConfirm}
        cancelButtonProps={{
          onClick: (e) => {
            e.stopPropagation();
            onCancel();
          },
        }}
        okButtonProps={{
          loading: confirmLoading,
          onClick: (e) => {
            e.stopPropagation();
            onConfirm();
          },
        }}
      >
        <Button
          className="bg-white border-primary text-primary"
          type="primary"
          shape="round"
          icon={<DeleteOutlined className="align-text-top" />}
          onClick={async (e) => {
            e.stopPropagation();
            setVisible(true);
          }}
        >
          Delete
        </Button>
      </Popconfirm>
    </div>
  );
};
