import { FIELD_BY_ORDER, BLANK, NULL_TIME } from '../../../constants';
import { EnabledTimes } from '../../../TimePicker.types';
import { isTimeDisabled, sortTimesFn } from '../../../utils';

export const toTimeField = (str: string | number) =>
  str.toString().padStart(2, '0');

// Returns the FIELD_BY_ORDER corresponding to current caret position
export const getFieldFromCaretPosition = (pos: number) =>
  Math.floor(pos / 3) + 1;

// Returns the caret position corresponding to given FIELD_BY_ORDER
export const getCaretPositionFromField = (field: FIELD_BY_ORDER) =>
  (field - 1) * 3;

export const parseTime = (timeStr: string) => ({
  hour: timeStr.substr(0, 2),
  minute: timeStr.substr(3, 2),
});

export const isValidTime = (timeStr: string, useAmPm: boolean = false) => {
  // HH:MM
  const test12 = /^(0[1-9]|1[0-2]):([0-5][0-9])$/;
  const test24 = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return useAmPm ? test12.test(timeStr) : test24.test(timeStr);
};

const parseIntOrZero = (str: string) => parseInt(str, 10) || 0;

const getNearestAvailableTime = ({
  time,
  dir,
  enabledTimes = [],
}: {
  time: string;
  dir: 'up' | 'down';
  enabledTimes?: EnabledTimes;
}) => {
  let nearestAvailableTime;
  const sortedEnabledTimes = enabledTimes.sort(sortTimesFn);

  if (dir === 'up') {
    const nearestAboveTime = sortedEnabledTimes.find(
      ({ startTime }) => startTime >= time,
    );

    nearestAvailableTime =
      nearestAboveTime?.startTime || sortedEnabledTimes[0].startTime;
  } else if (dir === 'down') {
    const nearestBelowTime = sortedEnabledTimes
      .reverse()
      .find(({ endTime }) => endTime <= time);

    nearestAvailableTime =
      nearestBelowTime?.endTime || sortedEnabledTimes[0].endTime;
  }

  return nearestAvailableTime || time;
};

const changeTime = ({
  value,
  field,
  step = 1,
  enabledTimes,
}: {
  value: string;
  field: FIELD_BY_ORDER;
  step?: number;
  enabledTimes?: EnabledTimes;
}) => {
  let { hour, minute } = parseTime(value);

  switch (field) {
    case FIELD_BY_ORDER.HOUR:
      // Were adding 24 to keep the value positive at all time (i.e. when hour == 00)
      hour = `${(parseIntOrZero(hour) + 24 + Math.sign(step)) % 24}`;
      break;

    case FIELD_BY_ORDER.AMPM:
      if (hour !== BLANK) {
        // Adding 12 to change from AM to PM value or vice versa
        hour = `${(parseIntOrZero(hour) + 12) % 24}`;
      }
      break;

    case FIELD_BY_ORDER.MINUTE:
      let nMinute = parseIntOrZero(minute);
      nMinute += step;
      if (nMinute > 59) {
        nMinute -= 60;
        if (hour !== BLANK) {
          hour = `${(parseIntOrZero(hour) + 1) % 24}`;
        }
      } else if (nMinute < 0) {
        nMinute += 60;
        if (hour !== BLANK) {
          hour = `${(parseIntOrZero(hour) + 23) % 24}`;
        }
      }
      minute = `${nMinute}`;
      break;

    default:
  }

  let time = `${toTimeField(hour)}:${toTimeField(minute)}`;

  if (isTimeDisabled({ time, enabledTimes })) {
    time = getNearestAvailableTime({
      time,
      dir: step > 0 ? 'up' : 'down',
      enabledTimes,
    });
  }

  return time;
};

export const increment = ({
  value,
  field,
  step = 1,
  enabledTimes,
}: {
  value: string;
  field: FIELD_BY_ORDER;
  step?: number;
  enabledTimes?: EnabledTimes;
}) =>
  changeTime({
    value,
    field,
    step,
    enabledTimes,
  });

export const decrement = ({
  value,
  field,
  step = 1,
  enabledTimes,
}: {
  value: string;
  field: FIELD_BY_ORDER;
  step?: number;
  enabledTimes?: EnabledTimes;
}) =>
  changeTime({
    value,
    field,
    step: step * -1,
    enabledTimes,
  });

export const convertToAmPm = (value: string) => {
  const parsedTime = parseTime(value);
  let hour = parsedTime.hour;
  const minute = parsedTime.minute;
  let ampm = 'AM';
  if (hour !== BLANK) {
    let nHour = parseInt(hour, 10);
    if (nHour > 11) {
      ampm = 'PM';
    }
    nHour = nHour % 12;
    if (nHour === 0) {
      nHour = 12;
    }
    hour = toTimeField(nHour);
  }
  return `${hour}:${minute} ${ampm}`;
};

export const nullTimeIfInvalid = (valueFromProps: string | null): string => {
  return valueFromProps && isValidTime(valueFromProps, false)
    ? valueFromProps
    : NULL_TIME;
};

export const highlightField = (
  input: HTMLInputElement | null,
  field: FIELD_BY_ORDER,
) => {
  const highlightFieldCallback = () => {
    const startPos = getCaretPositionFromField(field);
    if (startPos < 0) {
      return;
    }
    input?.setSelectionRange(startPos, startPos + 2);
  };
  // setTimeout to avoid cursor issues
  setTimeout(highlightFieldCallback, 0);
};

export const getHourAfterTyping = (
  hour: string,
  newTypedNumber: number,
  useAmPmFormat: boolean,
) => {
  let nHour = parseInt(`${hour[1]}${newTypedNumber}`, 10);
  if (nHour > 12 && useAmPmFormat) {
    nHour = 12;
  }
  if (nHour > 23) {
    nHour = 23;
  }
  return `${nHour}`;
};
