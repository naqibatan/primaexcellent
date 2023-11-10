import {
  withValidation,
  composeSDKFactories,
  reportError,
  messages,
  labelPropsSDKFactory,
  readOnlyPropsSDKFactory,
  createValidationPropsSDKFactory,
  createRequiredPropsSDKFactory,
  focusPropsSDKFactory,
  disablePropsSDKFactory,
  changePropsSDKFactory,
  createElementPropsSDKFactory,
  toJSONBase,
  createInputValidator,
  InputValidator,
  composeValidators,
  validateRequired,
} from '@wix/editor-elements-corvid-utils';
import { createComponentSDKModel } from '@wix/editor-elements-integrations/corvid';
import type {
  ITimePickerProps,
  ITimePickerOwnSDKFactory,
  ITimePickerSDK,
  ITimePickerImperativeActions,
  TimeSlot,
} from '../TimePicker.types';
import {
  getLongTimeFromDate,
  isValidTimeFormat,
  completeToLongTime,
  roundDownSeconds,
} from '../utils';
import { validateEnabledTime } from './validateEnabledTime';

const timePickerValidator: InputValidator<
  ITimePickerProps,
  ITimePickerImperativeActions
> = createInputValidator(
  composeValidators<ITimePickerProps>([validateRequired, validateEnabledTime]),
);

const validationPropsSDKFactory = createValidationPropsSDKFactory<
  ITimePickerProps,
  ITimePickerImperativeActions
>(timePickerValidator);

const requiredPropsSDKFactory = createRequiredPropsSDKFactory<
  ITimePickerProps,
  ITimePickerImperativeActions
>(timePickerValidator);

const _ownSDKFactory: ITimePickerOwnSDKFactory = api => {
  const { props, setProps, metaData } = api;

  const sdkProps = {
    get value() {
      // TODO: remove after TB-939 is fixed
      if (props.initialTime === 'current' && !props.value) {
        const currentTime = getLongTimeFromDate(new Date(Date.now()));
        return currentTime;
      }
      return props.value;
    },
    set value(value) {
      const fullTime = completeToLongTime(value);
      setProps({ value: fullTime });

      timePickerValidator.validate({
        viewerSdkAPI: api,
        showValidityIndication: true,
      });
    },
    get step() {
      return props.step;
    },
    set step(step) {
      setProps({ step });
    },
    get useAmPmFormat() {
      return props.useAmPmFormat;
    },
    set useAmPmFormat(useAmPmFormat) {
      setProps({ useAmPmFormat });
    },
    get enabledTimes() {
      return props.enabledTimes;
    },
    set enabledTimes(enabledTimes) {
      enabledTimes.forEach((timeSlot: TimeSlot) => {
        timeSlot.startTime =
          roundDownSeconds(timeSlot.startTime) || timeSlot.startTime;
        timeSlot.endTime =
          roundDownSeconds(timeSlot.endTime) || timeSlot.endTime;
      });

      setProps({ enabledTimes });

      timePickerValidator.validate({
        viewerSdkAPI: api,
        showValidityIndication: true,
      });
    },
    toJSON() {
      const { value } = sdkProps;
      return {
        ...toJSONBase(metaData),
        value,
      };
    },
  };

  return sdkProps;
};

const validateTimeValue = (
  value: string,
  propertyName = 'value',
  functionName = 'value',
) => {
  const isValid = isValidTimeFormat(value);

  if (!isValid) {
    reportError(
      messages.invalidFormatMessageWithHint({
        propertyName,
        functionName,
        wrongValue: value,
        hint: 'HH:MM, HH:MM:SS, or HH:MM:SS.mmm',
      }),
    );
  }

  return isValid;
};

const ownSDKFactory = withValidation(
  _ownSDKFactory,
  {
    type: ['object'],
    properties: {
      value: {
        type: ['string', 'nil'],
      },
      step: {
        type: ['integer'],
        minimum: 1,
        maximum: 60,
      },
      useAmPmFormat: {
        type: ['boolean'],
      },
      enabledTimes: {
        type: ['array'],
        properties: {
          startTime: {
            type: ['string'],
          },
          endTime: {
            type: ['string'],
          },
        },
        required: ['startTime', 'endTime'],
      },
    },
  },
  {
    value: [
      _value => {
        if (!_value) {
          return true;
        }

        return validateTimeValue(_value);
      },
    ],
    enabledTimes: [
      _enabledTimes => {
        let isEnabledTimesValid = true;

        _enabledTimes.forEach((timeSlot: TimeSlot) => {
          isEnabledTimesValid = validateTimeValue(
            timeSlot.startTime,
            'enabledTimes',
            'enabledTimes',
          );
          isEnabledTimesValid = validateTimeValue(
            timeSlot.endTime,
            'enabledTimes',
            'enabledTimes',
          );
        });

        return isEnabledTimesValid;
      },
      _enabledTimes => {
        let isEnabledTimesValid = true;

        _enabledTimes.forEach((timeSlot: TimeSlot) => {
          if (timeSlot.startTime > timeSlot.endTime) {
            isEnabledTimesValid = false;
            reportError(
              messages.invalidObjectFormatWithCustomMessage({
                keyName: 'startTime',
                propertyName: 'enabledTimes',
                functionName: 'enabledTimes',
                wrongValue: timeSlot.startTime,
                message: 'Bad format, startTime must be before endTime',
              }),
            );
          }
        });

        return isEnabledTimesValid;
      },
    ],
  },
);

const elementPropsSDKFactory = createElementPropsSDKFactory();

export const sdk = composeSDKFactories<ITimePickerProps, ITimePickerSDK, any>([
  elementPropsSDKFactory,
  disablePropsSDKFactory,
  focusPropsSDKFactory,
  readOnlyPropsSDKFactory,
  requiredPropsSDKFactory,
  validationPropsSDKFactory,
  changePropsSDKFactory,
  labelPropsSDKFactory,
  ownSDKFactory,
]);

export default createComponentSDKModel(sdk);
