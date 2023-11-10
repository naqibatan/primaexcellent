export const enum FIELD_BY_ORDER {
  BEFORE = 0,
  HOUR = 1,
  MINUTE = 2,
  AMPM = 3,
  AFTER = 4,
}

export const TIME_SUFFIX = ':00.000';
export const BLANK = '--';
export const NULL_TIME = `${BLANK}:${BLANK}`;

export const TEST_IDS = {
  label: 'label',
  dropdown: 'timepicker-dropdown',
  stepper: 'timepicker-stepper',
  tickerButtonUp: 'ticker-button-up',
  tickerButtonDown: 'ticker-button-down',
};

export const TranslationKeys = {
  Namespace: 'timePicker',
  TIME_PICKER_INVALID_TIME: 'time_picker_invalid_time',
  TIME_PICKER_INVALID_TIME_DEFAULT:
    'This time isn’t available. Pick a different time.',
};
