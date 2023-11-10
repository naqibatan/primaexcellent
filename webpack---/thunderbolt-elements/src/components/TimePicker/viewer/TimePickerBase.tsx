import * as React from 'react';
import {
  customCssClasses,
  getDataAttributes,
} from '@wix/editor-elements-common-utils';
import {
  ITimePickerBaseProps,
  ITimePickerImperativeActions,
} from '../TimePicker.types';
import { getLongTimeFromDate, getShortTime, getLongTime } from '../utils';
import { TEST_IDS } from '../constants';
import semanticClassNames from '../TimePicker.semanticClassNames';
import { st, classes } from './style/TimePicker.st.css';

const noop = () => {};

const TimePickerBase: React.ForwardRefRenderFunction<
  ITimePickerImperativeActions,
  ITimePickerBaseProps
> = (props, ref) => {
  const {
    id,
    className,
    customClassNames = [],
    label,
    isDisabled,
    required,
    placeholder,
    value,
    initialTime,
    useAmPmFormat,
    step,
    readOnly,
    controller,
    ControllerComponent,
    enabledTimes,
    isValid,
    shouldShowValidityIndication,
    isResponsive,
    translations,
    validateValueAndShowIndication = noop,
    hideValidityIndication = noop,
    onValueChange = noop,
    onChange = noop,
    onFocus = noop,
    onBlur = noop,
    onMouseEnter = noop,
    onMouseLeave = noop,
  } = props;

  const [isFocused, setFocused] = React.useState<boolean>(false);

  const [isInitialTimeSet, setInitialTimeSet] = React.useState<boolean>(false);

  const [valueChanged, setValueChanged] = React.useState<boolean>();

  const inputRef = React.useRef<ITimePickerImperativeActions>(null);

  React.useEffect(() => {
    if (!isInitialTimeSet && !value && initialTime === 'current') {
      // Using setTimeout to bypass TB-4995
      setTimeout(() => {
        const currentTime = getLongTimeFromDate(new Date(Date.now()));
        onValueChange(currentTime);
        setInitialTimeSet(true);
        validateValueAndShowIndication();
      }, 0);
    }
  }, [
    initialTime,
    isInitialTimeSet,
    validateValueAndShowIndication,
    onValueChange,
    value,
  ]);

  React.useImperativeHandle(ref, () => {
    return {
      focus: () => {
        setFocused(true);
        inputRef.current?.focus();
      },
      blur: () => {
        setFocused(false);
        inputRef.current?.blur();
      },
      setCustomValidity: message => {
        inputRef.current?.setCustomValidity(message);
      },
      getValidationMessage: () => {
        return inputRef.current?.getValidationMessage();
      },
    };
  });

  const _onValueChange = (shortTime?: string | null) => {
    const longTime = getLongTime(shortTime);
    if (longTime === value) {
      return;
    }
    onValueChange(longTime);
    hideValidityIndication();
    setValueChanged(true);
  };

  const _onFocus: React.FocusEventHandler = event => {
    setFocused(true);
    onFocus(event);
  };

  const _onBlur: React.FocusEventHandler = event => {
    setFocused(false);
    validateValueAndShowIndication();
    onBlur(event);
    if (valueChanged && controller !== 'dropdown') {
      onChange({
        ...(event as any),
        type: 'change',
      });
    }
    setValueChanged(false);
  };

  const _onMouseEnter: React.MouseEventHandler<HTMLDivElement> = event => {
    if (!isDisabled) {
      onMouseEnter(event);
    }
  };

  const _onMouseLeave: React.MouseEventHandler<HTMLDivElement> = event => {
    if (!isDisabled) {
      onMouseLeave(event);
    }
  };

  const isError = !isValid && shouldShowValidityIndication;

  return (
    <div
      id={id}
      {...getDataAttributes(props)}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      className={st(
        classes.root,
        {
          isError,
          isDisabled,
          isFocused,
          required: required && !!label,
          hasLabel: !!label,
          isResponsive,
        },
        className,
        customCssClasses(semanticClassNames.root, ...customClassNames),
      )}
    >
      {!!label && (
        <label
          data-testid={TEST_IDS.label}
          className={st(
            classes.label,
            customCssClasses(semanticClassNames.label),
          )}
          htmlFor={`input_${id}`}
        >
          {label || ''}
        </label>
      )}
      <div
        className={st(classes.wrapper, {
          isResponsive,
        })}
      >
        <ControllerComponent
          compId={id}
          isDisabled={isDisabled}
          onChange={onChange}
          onValueChange={_onValueChange}
          validateValueAndShowIndication={validateValueAndShowIndication}
          onFocus={_onFocus}
          onBlur={_onBlur}
          placeholder={placeholder}
          useAmPmFormat={useAmPmFormat}
          step={step}
          readOnly={readOnly}
          value={getShortTime(value)}
          required={required}
          ref={inputRef}
          controller={controller}
          isFocused={isFocused}
          className={classes.controller}
          enabledTimes={enabledTimes}
          translations={translations}
        />
      </div>
    </div>
  );
};

export default React.forwardRef(TimePickerBase);
