import generatePicker from 'antd/lib/date-picker/generatePicker';
import { Dayjs } from 'dayjs';
// eslint-disable-next-line import/no-extraneous-dependencies
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
// import 'antd/es/date-picker/style/index';

export const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);
