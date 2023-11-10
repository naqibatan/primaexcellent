import {
  ValidationData,
  addErrorToValidationDataAndKeepHtmlMessage,
} from '@wix/editor-elements-corvid-utils';
import { isTimeDisabled } from '../utils';

export const validateEnabledTime = (
  props: {
    value?: string | null;
    enabledTimes: Array<{ startTime: string; endTime: string }>;
  },
  validationData: ValidationData,
): ValidationData => {
  const { value, enabledTimes } = props;

  if (!value) {
    return validationData;
  }
  let invalidData;

  if (isTimeDisabled({ enabledTimes, time: value })) {
    invalidData = addErrorToValidationDataAndKeepHtmlMessage(
      validationData,
      'invalidTime',
      {
        key: 'TIME_PICKER_INVALID_TIME',
      },
    );
  }

  return invalidData || validationData;
};
