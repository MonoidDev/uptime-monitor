import * as React from 'react';

import { PickerTimeProps } from 'antd/lib/date-picker/generatePicker';
import { Dayjs } from 'dayjs';

import { DatePicker } from './DatePicker';

export interface TimePickerProps extends Omit<PickerTimeProps<Dayjs>, 'picker'> {}

export const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => {
  return <DatePicker {...props} picker="time" mode={undefined} ref={ref} />;
});

TimePicker.displayName = 'TimePicker';
