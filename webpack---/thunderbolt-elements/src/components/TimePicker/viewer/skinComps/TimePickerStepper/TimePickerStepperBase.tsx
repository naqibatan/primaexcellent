import * as React from 'react';
import { customCssClasses } from '@wix/editor-elements-common-utils';
import {
  ITimePickerImperativeActions,
  ITimePickerStepperProps,
} from '../../../TimePicker.types';
import { BLANK, FIELD_BY_ORDER, NULL_TIME, TEST_IDS } from '../../../constants';
import { getTimePickerInputImperativeHandle } from '../../../utils';
import semanticClassNames from '../../../TimePicker.semanticClassNames';
import { st, classes } from './styles/TimePickerStepper.st.css';
import {
  increment,
  decrement,
  getFieldFromCaretPosition,
  highlightField,
  nullTimeIfInvalid,
  isValidTime,
  parseTime,
  convertToAmPm,
  getHourAfterTyping,
  toTimeField,
} from './stepperUtils';
import Tickers from './Tickers/Tickers';

const noop = () => {};

const TimePickerStepperBase: React.ForwardRefRenderFunction<
  ITimePickerImperativeActions,
  ITimePickerStepperProps
> = (props, ref) => {
  const {
    compId,
    value: valueProp = null,
    step = 1,
    useAmPmFormat = false,
    required,
    isDisabled = false,
    readOnly = false,
    isFocused = false,
    controller,
    onChange = noop,
    onFocus = noop,
    onBlur = noop,
    onValueChange = noop,
    className,
    enabledTimes,
    translations,
  } = props;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = React.useState(
    nullTimeIfInvalid(valueProp),
  );
  const [prevValueProp, setPrevValueProp] = React.useState<null | string>(null);
  const [shouldHighlightOnFocus, setShouldHighlightOnFocus] =
    React.useState(true);
  const [hasStartedTyping, setHasStartedTyping] = React.useState(false);
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const [isKeyDown, setIsKeyDown] = React.useState(false);
  const [lastFocusedField, setLastFocusedField] =
    React.useState<FIELD_BY_ORDER>(FIELD_BY_ORDER.BEFORE);

  if (prevValueProp !== valueProp) {
    if (valueProp !== displayValue) {
      setDisplayValue(nullTimeIfInvalid(valueProp));
    }
    setPrevValueProp(valueProp);
  }

  React.useImperativeHandle(ref, () => {
    return getTimePickerInputImperativeHandle(inputRef, translations);
  });

  const onMouseDown = () => {
    setShouldHighlightOnFocus(false);
    setHasStartedTyping(false);
    setIsMouseDown(true);
  };

  const onMouseUp = () => {
    setIsMouseDown(false);
  };

  const onMouseMove = (event: React.MouseEvent<HTMLInputElement>) => {
    if (isMouseDown) {
      event.preventDefault();
    }
  };

  const onClick = (event: React.MouseEvent<HTMLInputElement>) => {
    // Highlighting on click instead of mouseDown because the selectionStart isn't set yet
    const inputElement = event.currentTarget;
    const field = getFieldFromCaretPosition(inputElement.selectionStart || 0);
    highlightField(inputElement, field);
  };

  const _onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setShouldHighlightOnFocus(event.currentTarget !== document.activeElement);
    setHasStartedTyping(false);
    setLastFocusedField(
      getFieldFromCaretPosition(event.currentTarget.selectionStart || 0),
    );

    if (displayValue === NULL_TIME) {
      if (valueProp) {
        onValueChange(null);
      }
    } else if (isValidTime(displayValue, useAmPmFormat)) {
      if (valueProp !== displayValue) {
        onValueChange(displayValue);
      }
      // For example - display value can be --:30, 12:--, 12:99 - new value will be 00:30, 12:00 and 12:59
    } else {
      const { hour, minute } = parseTime(displayValue);
      const nHour = parseInt(hour, 10) || 0;
      let nMinute = parseInt(minute, 10) || 0;
      if (nMinute > 59) {
        nMinute = 59;
      }
      const newValue = `${toTimeField(nHour)}:${toTimeField(nMinute)}`;
      if (newValue !== valueProp) {
        onValueChange(newValue);
        // If valueProp was 12:59, and displayValue is 12:99, we want to set the new displayValue, but we don't need to update valueProp
      } else {
        setDisplayValue(newValue);
      }
    }

    onBlur(event);
  };

  const _onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    // shouldHighlightOnFocus is set to false on every mouse down - meaning that if we press the field using our mouse -
    // onMouseDown will be called before onFocus and we will not highlight the hour field here (instead - we will highlight the relevant field in onClick)
    // Whenever we are focused externally - for example via Corvid, shouldHighlightOnFocus will be truthy and we will trigger highlight on hour.
    if (shouldHighlightOnFocus) {
      highlightField(event.target, FIELD_BY_ORDER.HOUR);
      setHasStartedTyping(false);
    }

    onFocus(event);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    /*
      Respond to:
      - tab
      - numbers
      - case-insensitive A, P (for am/pm)
      - arrow keys
      - delete and backspace
    */

    if (e.altKey || e.ctrlKey || e.metaKey || readOnly) {
      return;
    }
    if (!isKeyDown) {
      setIsKeyDown(true);
    }

    const inputElement = e.currentTarget;
    const startPos = inputElement.selectionStart || 0;
    let currentField = getFieldFromCaretPosition(startPos);

    // Checking for TAB first because it's the only key that might have default behavior
    // Shift focus between fields if tab is pressed, or use regular behavior if the field is on the edge
    // i.e., tabbing while on AM/PM or shift+tab on hour
    if (e.key === 'Tab') {
      handleTab();
      return;
    }

    // Block other input default behavior
    e.preventDefault();

    // Handle numeric input
    if (/^[0-9]$/.test(e.key)) {
      handleNumericKey();
      return;
    }

    setHasStartedTyping(false);

    // All the rest: arrow keys, tab, delete, backspace, A/P
    switch (e.key) {
      // Change focus on arrow left or right
      case 'ArrowLeft': {
        handleArrowLeft();
        break;
      }

      case 'ArrowRight': {
        handleArrowRight();
        break;
      }

      // Increment or decrement for up/down arrows
      case 'ArrowUp':
      case 'ArrowDown': {
        handleArrowUpDown();
        break;
      }

      // AM / PM only if on relevant field
      case 'a':
      case 'A':
      case 'p':
      case 'P': {
        if (currentField !== FIELD_BY_ORDER.AMPM) {
          break;
        }
        handleAmPm();
        break;
      }

      // Change field to BLANK on delete or backspace. Ignore if field is AM/PM
      case 'Delete':
      case 'Backspace': {
        handleDeletion();
        break;
      }
      default:
    }

    function handleTab() {
      currentField += e.shiftKey ? -1 : 1;
      if (
        currentField === FIELD_BY_ORDER.HOUR ||
        currentField === FIELD_BY_ORDER.MINUTE ||
        (currentField === FIELD_BY_ORDER.AMPM && useAmPmFormat)
      ) {
        e.preventDefault();
        highlightField(inputElement, currentField);
      }
    }

    function handleNumericKey() {
      const num = parseInt(e.key, 10);
      let { hour, minute } = parseTime(displayValue);

      if (currentField === FIELD_BY_ORDER.HOUR) {
        if (hasStartedTyping) {
          hour = getHourAfterTyping(hour, num, useAmPmFormat);
          currentField = FIELD_BY_ORDER.MINUTE;
          setHasStartedTyping(false);
        } else {
          if ((num > 1 && useAmPmFormat) || num > 2) {
            currentField = FIELD_BY_ORDER.MINUTE;
          } else {
            setHasStartedTyping(true);
          }
          hour = e.key;
        }
      } else if (currentField === FIELD_BY_ORDER.MINUTE) {
        if (hasStartedTyping) {
          minute = `${parseInt(`${minute[1]}${num}`, 10)}`;
        } else {
          setHasStartedTyping(true);
          minute = e.key;
        }
      }

      const newValue = `${toTimeField(hour)}:${toTimeField(minute)}`;
      if (isValidTime(newValue)) {
        onValueChange(newValue);
      } else {
        setDisplayValue(newValue);
      }
      highlightField(inputElement, currentField);
    }

    function handleArrowLeft() {
      currentField -= 1;
      if (currentField === FIELD_BY_ORDER.BEFORE) {
        currentField = FIELD_BY_ORDER.HOUR;
      }
      highlightField(inputElement, currentField);
    }

    function handleArrowRight() {
      currentField += 1;
      if (currentField === FIELD_BY_ORDER.AMPM && !useAmPmFormat) {
        currentField = FIELD_BY_ORDER.MINUTE;
      }
      if (currentField === FIELD_BY_ORDER.AFTER) {
        currentField = FIELD_BY_ORDER.AMPM;
      }
      highlightField(inputElement, currentField);
    }

    function handleArrowUpDown() {
      const newValue =
        e.key === 'ArrowUp'
          ? increment({ value: displayValue, field: currentField, step })
          : decrement({ value: displayValue, field: currentField, step });
      if (isValidTime(newValue)) {
        onValueChange(newValue);
      } else {
        setDisplayValue(newValue);
      }
      highlightField(inputElement, currentField);
    }

    function handleAmPm() {
      const { hour } = parseTime(displayValue);
      const nHour = parseInt(hour, 10);
      if (
        (nHour < 12 && (e.key === 'p' || e.key === 'P')) ||
        (nHour > 11 && (e.key === 'a' || e.key === 'A'))
      ) {
        const newValue = increment({
          value: displayValue,
          field: FIELD_BY_ORDER.AMPM,
        });
        onValueChange(newValue);
        highlightField(inputElement, FIELD_BY_ORDER.AMPM);
      }
    }

    function handleDeletion() {
      if (
        currentField === FIELD_BY_ORDER.HOUR ||
        currentField === FIELD_BY_ORDER.MINUTE
      ) {
        const { hour, minute } = parseTime(displayValue);
        const newValue =
          currentField === FIELD_BY_ORDER.HOUR
            ? `${BLANK}:${minute}`
            : `${hour}:${BLANK}`;
        if (newValue === NULL_TIME) {
          onValueChange(null);
        } else {
          setDisplayValue(newValue);
        }
        highlightField(inputElement, currentField);
      }
    }
  };

  const tick = (action: Function) => {
    if (readOnly) {
      return;
    }

    const startPos = inputRef.current?.selectionStart || 0;
    const currentField = getFieldFromCaretPosition(startPos);
    const field = isFocused
      ? currentField
      : lastFocusedField || FIELD_BY_ORDER.MINUTE;

    const newValue = action({
      value: displayValue,
      field,
      step,
      enabledTimes,
    });
    if (isValidTime(newValue)) {
      onValueChange(newValue);
      // onChange is triggered for each tick
      onChange({
        type: 'change',
        target: {
          value: newValue,
        },
      });
    } else {
      setDisplayValue(newValue);
    }
    highlightField(inputRef.current, currentField);
  };

  const formattedValue = React.useMemo(
    () => (useAmPmFormat ? convertToAmPm(displayValue) : displayValue),
    [displayValue, useAmPmFormat],
  );

  return (
    <div
      aria-label="Time Picker"
      data-testid={TEST_IDS.stepper}
      className={st(classes.controller, { isKeyDown }, className)}
    >
      <input
        id={`input_${compId}`}
        className={st(
          classes.nativeInput,
          customCssClasses(semanticClassNames.input),
        )}
        ref={inputRef}
        type="text"
        value={formattedValue}
        required={required}
        disabled={isDisabled}
        readOnly={readOnly}
        onDragStart={e => e.stopPropagation()}
        onChange={() => {}}
        onBlur={_onBlur}
        onFocus={_onFocus}
        onKeyDown={onKeyDown}
        onKeyUp={() => setIsKeyDown(false)}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onClick={onClick}
      />
      {controller === 'stepper' && (
        <Tickers
          isDisabled={isDisabled}
          onIncrement={() => tick(increment)}
          onDecrement={() => tick(decrement)}
        />
      )}
    </div>
  );
};

export default React.forwardRef(TimePickerStepperBase);
