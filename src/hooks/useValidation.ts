import { useMemo, useState } from 'react';

import { Form } from 'antd';
import * as t from 'io-ts';
import * as h from 'tyrann-io';

import { createValidate } from '../utils/createValidate';

export type Validators = { [key in string]: h.Validator<any> };

export interface ValidationOptions<P, A> {
  type: t.InterfaceType<P, A>;
  initialValues: t.TypeOf<t.InterfaceType<P, A>>;
  onSubmit?: (values: t.TypeOf<t.InterfaceType<P, A>>) => Promise<void>;
}

export const useValidation = <T extends Validators, A = any>(
  options: ValidationOptions<T, A>,
) => {
  const {
    type,
    initialValues,
    onSubmit,
  } = options;

  const [form] = Form.useForm();
  const [values, setValues] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);

  const validate = useMemo(
    () => createValidate(type),
    [type],
  );

  const errors = validate(values);

  const shouldDisplayError = (key: keyof T) => {
    return (submitted || form.isFieldTouched(key as string)) && key in errors;
  };

  return {
    form: {
      form,
      initialValues,
      onValuesChange(_: any, _values: any) {
        setValues(_values);
      },
      async onFinish(_values: t.TypeOf<t.InterfaceType<T, A>>) {
        setSubmitted(true);
        setValues(_values);
        if (Object.keys(errors).length === 0) {
          await onSubmit?.(_values);
        }
      },
    },
    item(key: keyof T) {
      return {
        label: type.props[key].label,
        name: key,
        validateStatus: shouldDisplayError(key) ? 'error' as const : undefined,
        help: shouldDisplayError(key) && errors[key],
      };
    },
    reset() {
      form.resetFields();
      setSubmitted(false);
    },
  };
};
