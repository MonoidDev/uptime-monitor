import { useEffect, useMemo, useState } from 'react';

import type { ApolloError } from '@apollo/client';
import { Form } from 'antd';
import * as t from 'io-ts';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import * as h from 'tyrann-io';

import { NexusValidateError } from '../../scripts/nexusValidateInput';
import { createValidate } from '../utils/createValidate';

export const extractServerMessages = (error: ApolloError): string[] => {
  return error.graphQLErrors
    .filter((e) => !('errors' in (e.extensions ?? {})))
    .map((e) => e.message);
};

export const extractServerFormErrors = (error: ApolloError): NexusValidateError => {
  return merge(
    {},
    ...error.graphQLErrors
      .filter((e) => 'errors' in (e.extensions ?? {}))
      .map((e) => e.extensions!.errors),
  );
};

export type Validators = { [key in string]: h.Validator<any> };

export interface ValidationOptions<P, A> {
  type: t.InterfaceType<P, A>;
  initialValues: t.TypeOf<t.InterfaceType<P, A>>;
  error?: ApolloError;
  onSubmit?: (values: t.TypeOf<t.InterfaceType<P, A>>) => Promise<void>;
}

export const useValidation = <T extends Validators, A = any>(
  options: ValidationOptions<T, A>,
) => {
  const {
    type,
    initialValues,
    error,
    onSubmit,
  } = options;

  const [form] = Form.useForm();
  const [values, setValues] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);

  const [serverError, setServerError] = useState({
    messages: error && extractServerMessages(error),
    formErrors: error && extractServerFormErrors(error),
  });

  useEffect(() => {
    setServerError({
      messages: error && extractServerMessages(error),
      formErrors: error && extractServerFormErrors(error),
    });
  }, [error]);

  const validate = useMemo(
    () => createValidate(type),
    [type],
  );

  const errors = validate(values);

  const shouldDisplayError = (key: keyof T) => {
    return (submitted || form.isFieldTouched(key as string))
    && (key in errors || key in (serverError.formErrors ?? {}));
  };

  const getFieldErrorMessage = (key: keyof T) => {
    return [
      errors[key],
      serverError.formErrors?.[key as string],
    ].filter(Boolean).join('\n');
  };

  return {
    form: {
      form,
      initialValues,
      onValuesChange(changes: any, _values: any) {
        setValues(_values);
        setServerError((e) => ({
          ...e,
          formErrors: e.formErrors && omit(e.formErrors, Object.keys(changes)),
        }));
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
        help: shouldDisplayError(key) && getFieldErrorMessage(key),
      };
    },
    reset() {
      form.resetFields();
      setSubmitted(false);
    },
    serverError,
  };
};
