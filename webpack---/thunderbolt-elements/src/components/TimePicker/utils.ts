import { TIME_SUFFIX, TranslationKeys } from './constants';
import {
  DisabledTimes,
  TimeSlot,
  EnabledTimes,
  ITimePickerImperativeActions,
  ITimePickerMapperProps,
  EnabledTimeOption,
} from './TimePicker.types';

/**
 * @example
 * Output: 15:26:00.000
 */
export const getLongTimeFromDate = (date: Date) => {
  return `${date.toTimeString().substr(0, 5)}${TIME_SUFFIX}`;
};

/**
 * @example
 * Input: 15:26:13:123
 * Output: 15:26
 */
export const getShortTime = (longTime?: string | null) => {
  return !longTime ? longTime : longTime.substr(0, 5);
};

/**
 * @example
 * Input: 15:26
 * Output: 15:26:00.000
 */
export const getLongTime = (shortTime?: string | null) => {
  return !shortTime ? shortTime : `${shortTime}${TIME_SUFFIX}`;
};

const formatTimePart = (part: number) => part.toString().padStart(2, '0');

/**
 * @example
 * Input: 15:26
 * Output: 03:26 PM
 * Input: 03:26
 * Output: 03:26 AM
 */
export const getAmpmTime = (shortTime?: string | null) => {
  if (!shortTime) {
    return shortTime;
  }
  return shortTime.replace(/(\d\d):(\d\d)/, (_m, hoursGroup, minutesGroup) => {
    const hours = parseInt(hoursGroup, 10);
    if (hours < 12) {
      const fixedHours = hours === 0 ? 12 : hours;
      const hoursStr = formatTimePart(fixedHours);
      return `${hoursStr}:${minutesGroup} AM`;
    } else {
      const subtractedHours = hours - 12;
      const fixedHours = subtractedHours === 0 ? 12 : subtractedHours;
      const hoursStr = formatTimePart(fixedHours);
      return `${hoursStr}:${minutesGroup} PM`;
    }
  });
};

const getTimeFromAmountOfMinutes = (amountMinutes: number) => {
  const hours = Math.floor(amountMinutes / 60);
  const minutes = amountMinutes - hours * 60;

  const hoursStr = formatTimePart(hours);
  const minutesStr = formatTimePart(minutes);

  const isAm = hours < 12;
  const subtractedHours = isAm ? hours : hours - 12;
  const fixedHours = subtractedHours === 0 ? 12 : subtractedHours;
  const ampmHoursStr = formatTimePart(fixedHours);
  const ampm = isAm ? 'AM' : 'PM';

  return {
    time: `${hoursStr}:${minutesStr}`,
    ampmTime: `${ampmHoursStr}:${minutesStr} ${ampm}`,
  };
};

const getAmountOfMinutesFromTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':');
  const hoursNumber = Number(hours);
  const minutesNumber = Number(minutes);
  return hoursNumber * 60 + minutesNumber;
};

const getAvailableTimesPerTimeSlot = (
  timeSlot: TimeSlot,
  step: number,
): Array<EnabledTimeOption> => {
  const startTimeInMinutes = getAmountOfMinutesFromTime(timeSlot.startTime);
  const endTimeInMinutes = getAmountOfMinutesFromTime(timeSlot.endTime);
  const minutesInTimeSlot = endTimeInMinutes - startTimeInMinutes;

  const length = Math.floor(minutesInTimeSlot / step + 1);
  const availableTimes = Array(length)
    .fill(0)
    .map((_, index) => {
      const totalMinutes = index * step + startTimeInMinutes;
      const { time, ampmTime } = getTimeFromAmountOfMinutes(totalMinutes);

      return {
        time,
        ampmTime,
      };
    });

  const shouldRemoveLastItem =
    !timeSlot.endTime.startsWith('24:00') || minutesInTimeSlot % step === 0;
  return shouldRemoveLastItem ? availableTimes.slice(0, -1) : availableTimes;
};

export const getAvailableTimesPerDay = (
  step: number,
  enabledTimes: EnabledTimes = [],
) => {
  const nonEmptyEnabledTimes =
    enabledTimes && enabledTimes.length
      ? enabledTimes
      : [
          {
            startTime: '00:00',
            endTime: '24:00',
          },
        ];

  return nonEmptyEnabledTimes.reduce(
    (availableTimeOptions: Array<EnabledTimeOption>, timeSlot: TimeSlot) => {
      return [
        ...availableTimeOptions,
        ...getAvailableTimesPerTimeSlot(timeSlot, step),
      ];
    },
    [],
  );
};

const timeRegex =
  /^([0-1][0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9])(\.[0-9]{3})?)?$/;

const endOfDayTimeRegex = /^(24):(00)(:([0-5][0-9])(\.[0-9]{3})?)?$/;

export const isValidTimeFormat = (time?: string | null) => {
  return !time ? false : timeRegex.test(time) || endOfDayTimeRegex.test(time);
};

/**
 * @example
 * Input: 15:26
 * Output: 15:26:00.000
 * Input: 15:26:33
 * Output: 15:26:33.000
 * Input: 15:26:33.111
 * Output: 15:26:33.111
 */
export const completeToLongTime = (time?: string | null) => {
  return !time ? time : `${time}${TIME_SUFFIX.substr(time.length - 5)}`;
};

/**
 * @example
 * Input: 15:26
 * Output: 15:26:00.000
 * Input: 15:26:33
 * Output: 15:26:00.000
 * Input: 15:26:59.999
 * Output: 15:26:00.000
 */
export const roundDownSeconds = (time?: string | null) => {
  return !time ? time : `${time.substr(0, 5)}${TIME_SUFFIX}`;
};

export const getCurrentTimeValue = () =>
  `${new Date(Date.now()).toTimeString().slice(0, 5)}:00.000`;

const removeDuplicatesFromTimesArray = (arr: EnabledTimes | DisabledTimes) =>
  arr.filter((time, index, array) => {
    return (
      array.findIndex(
        secondTime =>
          time.startTime === secondTime.startTime &&
          time.endTime === secondTime.endTime,
      ) === index
    );
  });

const unifyTimesArray = (arr: EnabledTimes | DisabledTimes) => {
  const unifiedTimes: EnabledTimes = [];
  const arrWithoutDuplicates =
    removeDuplicatesFromTimesArray(arr).sort(sortTimesFn);
  const alreadyUnifiedTimesIndexes: Array<number> = [];

  arrWithoutDuplicates.forEach((time, index) => {
    const containedTimes = arrWithoutDuplicates.filter(
      ({ startTime }, idx) =>
        startTime >= time.startTime &&
        startTime <= time.endTime &&
        index !== idx,
    );

    if (
      containedTimes.length === 0 &&
      !alreadyUnifiedTimesIndexes.includes(index)
    ) {
      unifiedTimes.push(time);
    }

    let updatedTime = time;
    let shouldPushUpdatedTime = false;
    containedTimes.forEach(containedTime => {
      const containedTimeIdx = arrWithoutDuplicates.indexOf(containedTime);

      if (!alreadyUnifiedTimesIndexes.includes(containedTimeIdx)) {
        updatedTime = {
          startTime: updatedTime.startTime,
          endTime:
            containedTime.endTime > updatedTime.endTime
              ? containedTime.endTime
              : time.endTime,
        };

        shouldPushUpdatedTime = true;
      }

      alreadyUnifiedTimesIndexes.push(
        arrWithoutDuplicates.indexOf(containedTime),
      );
    });

    if (shouldPushUpdatedTime) {
      unifiedTimes.push(updatedTime);
    }
  });

  return unifiedTimes;
};

const isTimeInTimeSlot = ({
  time,
  timeSlot,
}: {
  time: string;
  timeSlot: TimeSlot;
}) => time > timeSlot.startTime && time < timeSlot.endTime;

/**
 * @description checks if src time slot is partially or fully contained in dest time slot
 * @example
 * input: {
 * src: {
 *  startTime: '12:00', endTime: '13:00'
 * }}
 * dest: {
 *  startTime: '09:00', endTime: '17:00'
 * }
 * output: true
 *
 * input: {
 * src: {
 *  startTime: '07:00', endTime: '10:00'
 * }}
 * dest: {
 *  startTime: '09:00', endTime: '17:00'
 * }
 * output: true
 *
 * input: {
 * src: {
 *  startTime: '07:00', endTime: '08:00'
 * }}
 * dest: {
 *  startTime: '09:00', endTime: '17:00'
 * }
 * output: false
 *
 */
const isTimeSlotPartiallyOrFullyContained = ({
  src,
  dest,
}: {
  src: TimeSlot;
  dest: TimeSlot;
}) => {
  const isStartTimeContained =
    src.startTime > dest.startTime && src.startTime < dest.endTime;
  const isEndTimeContained =
    src.endTime < dest.endTime && src.endTime > dest.startTime;

  return isStartTimeContained || isEndTimeContained;
};

/**
 * @description checks if src time slot is fully conrained in dest time slot
 */
const isTimeSlotFullyContained = ({
  src,
  dest,
}: {
  src: TimeSlot;
  dest: TimeSlot;
}) => src.startTime > dest.startTime && src.endTime < dest.endTime;

const intersectDisabledAndEnabledTimes = ({
  unifiedEnabledTimes,
  unifiedDisabledTimes,
}: {
  unifiedEnabledTimes: EnabledTimes;
  unifiedDisabledTimes: DisabledTimes;
}) => {
  if (unifiedDisabledTimes.length === 0) {
    return unifiedEnabledTimes;
  }

  const enabledTimesAfterIntersection: EnabledTimes = [];
  if (unifiedEnabledTimes.length === 0) {
    unifiedEnabledTimes.push({
      startTime: '00:00',
      endTime: '24:00',
    }); // endTime is 24 hours after startTime
  }

  unifiedEnabledTimes.forEach(enabledTime => {
    const containedDisabledTimes = unifiedDisabledTimes.filter(disabledTime =>
      isTimeSlotPartiallyOrFullyContained({
        src: disabledTime,
        dest: enabledTime,
      }),
    );
    let intersectedEnabledTime = enabledTime;

    if (containedDisabledTimes.length === 0) {
      enabledTimesAfterIntersection.push(enabledTime);
    }

    containedDisabledTimes.forEach(containedDisabledTime => {
      if (
        isTimeSlotFullyContained({
          src: containedDisabledTime,
          dest: intersectedEnabledTime,
        })
      ) {
        const splittedEnabledTime = [
          {
            startTime: intersectedEnabledTime.startTime,
            endTime: containedDisabledTime.startTime,
          },
          {
            startTime: containedDisabledTime.endTime,
            endTime: intersectedEnabledTime.endTime,
          },
        ];
        intersectedEnabledTime = splittedEnabledTime[1];
        enabledTimesAfterIntersection.pop();
        enabledTimesAfterIntersection.push(...splittedEnabledTime);
      } else {
        const updatedStartTime = isTimeInTimeSlot({
          time: containedDisabledTime.endTime,
          timeSlot: intersectedEnabledTime,
        })
          ? containedDisabledTime.endTime
          : intersectedEnabledTime.startTime;

        const updatedEndTime = isTimeInTimeSlot({
          time: containedDisabledTime.startTime,
          timeSlot: intersectedEnabledTime,
        })
          ? containedDisabledTime.startTime
          : intersectedEnabledTime.endTime;

        const updatedEnabledTime = {
          startTime: updatedStartTime,
          endTime: updatedEndTime,
        };

        intersectedEnabledTime = updatedEnabledTime;
        enabledTimesAfterIntersection.push(updatedEnabledTime);
      }
    });
  });
  return enabledTimesAfterIntersection;
};

export const sortTimesFn = (t1: TimeSlot, t2: TimeSlot) =>
  t1.startTime.localeCompare(t2.startTime);

/**
 * @description
 * Intersects disabled times with enabled times (disabled times overlaps enabled times)
 * @example
 * Input: {
 *  enabledTimes: [
 *    { startTime: '09:00', endTime: '13:00' }
 *  ],
 *  disabledTimes: [
 *    { startTime: '10:00', endTime: '11:00' }
 *  ]
 * }
 * Output: [
 *  { startTime: '09:00', endTime: '10:00' },
 *  { startTime: '11:00', endTime: '13:00' }
 * ]
 */
export const getEnabledTimes = ({
  enabledTimes = [],
  disabledTimes = [],
}: {
  enabledTimes: EnabledTimes;
  disabledTimes: DisabledTimes;
}) => {
  const unifiedEnabledTimes = unifyTimesArray(enabledTimes);
  const unifiedDisabledTimes = unifyTimesArray(disabledTimes);
  const intersectedTimes = intersectDisabledAndEnabledTimes({
    unifiedDisabledTimes,
    unifiedEnabledTimes,
  });

  return intersectedTimes;
};

export const getTimePickerInputImperativeHandle = (
  inputRef: React.RefObject<HTMLInputElement | HTMLSelectElement>,
  translations: ITimePickerMapperProps['translations'],
): ITimePickerImperativeActions => ({
  focus: () => {
    inputRef.current?.focus();
  },
  blur: () => {
    inputRef.current?.blur();
  },
  setCustomValidity: message => {
    const errorMsg =
      message.type === 'message'
        ? message.message
        : translations.invalidTime ||
          TranslationKeys.TIME_PICKER_INVALID_TIME_DEFAULT;

    inputRef.current?.setCustomValidity(errorMsg as any);
  },
  getValidationMessage: () => {
    return inputRef.current?.validationMessage;
  },
});

export const isTimeDisabled = ({
  time,
  enabledTimes = [],
}: {
  time: string;
  enabledTimes?: EnabledTimes;
}) => {
  if (enabledTimes.length === 0) {
    return false;
  }

  return !enabledTimes.some(
    ({ startTime, endTime }: { startTime: string; endTime: string }) => {
      const shortStartTime = getShortTime(startTime) || '';
      const shortEndTime = getShortTime(endTime) || '';

      return time >= shortStartTime && time < shortEndTime;
    },
  );
};
