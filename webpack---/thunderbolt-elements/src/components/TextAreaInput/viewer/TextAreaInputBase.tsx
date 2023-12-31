import * as React from 'react';
import classNames from 'clsx';
import {
  customCssClasses,
  getAriaAttributes,
  HAS_CUSTOM_FOCUS_CLASSNAME,
  getDataAttributes,
} from '@wix/editor-elements-common-utils';
import {
  ITextAreaInputBaseProps,
  ITextAreaInputImperativeActions,
} from '../TextAreaInput.types';
import semanticClassNames from '../TextAreaInput.semanticClassNames';
import { InlineErrorMessage } from '../../../core/inlineErrorMessage';
import style from './style/TextAreaInput.scss';

const noop = () => {};

const TextAreaInputBase: React.ForwardRefRenderFunction<
  ITextAreaInputImperativeActions,
  ITextAreaInputBaseProps
> = (props, ref) => {
  const {
    skin,
    id,
    className,
    customClassNames = [],
    value = '',
    label,
    placeholder,
    readOnly,
    required,
    isDisabled,
    maxLength,
    isResponsive,
    shouldShowValidityIndication,
    isValid,
    errorMessageType = 'tooltip',
    validateValue = noop,
    onValueChange = noop,
    setValidityIndication = noop,
    onBlur = noop,
    onFocus = noop,
    onKeyPress = noop,
    onInput = noop,
    onChange = noop,
    onClick = noop,
    onDblClick = noop,
    onMouseEnter = noop,
    onMouseLeave = noop,
    ariaAttributes,
    componentViewMode,
    translations,
  } = props;

  const [valueChanged, setValueChanged] = React.useState<boolean>();

  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(ref, () => {
    return {
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
      setCustomValidity: message => {
        if (message.type === 'message') {
          inputRef.current?.setCustomValidity(message.message);
        }
      },
    };
  });

  const _onChange: React.ChangeEventHandler<HTMLTextAreaElement> = event => {
    onValueChange(event.currentTarget.value);
    validateValue();
    setValueChanged(true);
    setValidityIndication(false);
    event.type = 'input';
    onInput(event);
  };

  const _onBlur: React.FocusEventHandler<HTMLTextAreaElement> = event => {
    setValidityIndication(true);
    onBlur(event);
    if (valueChanged) {
      onChange({
        ...event,
        type: 'change',
      });
    }
    setValueChanged(false);
  };

  const _onClick: React.MouseEventHandler<HTMLDivElement> = event => {
    if (!isDisabled) {
      onClick(event);
    }
  };

  const _onDblClick: React.MouseEventHandler<HTMLDivElement> = event => {
    if (!isDisabled) {
      onDblClick(event);
    }
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

  const hasLabel = !!label;

  const containerClasses = classNames(
    style[skin],
    className,
    customCssClasses(semanticClassNames.root, ...customClassNames),
    {
      [style.hasLabel]: hasLabel,
      [style.requiredIndication]: required,
      [style.validationIndication]: !!shouldShowValidityIndication,
    },
  );

  return (
    <div
      id={id}
      {...getDataAttributes(props)}
      className={containerClasses}
      onClick={_onClick}
      onDoubleClick={_onDblClick}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
    >
      <label
        htmlFor={`textarea_${id}`}
        className={classNames(
          style.label,
          customCssClasses(semanticClassNames.label),
        )}
      >
        {label}
      </label>
      <textarea
        ref={inputRef}
        id={`textarea_${id}`}
        className={classNames(
          style.textarea,
          HAS_CUSTOM_FOCUS_CLASSNAME,
          customCssClasses(semanticClassNames.input),
        )}
        rows={isResponsive ? 1 : undefined}
        value={value}
        onFocus={onFocus}
        onKeyDown={onKeyPress}
        onChange={_onChange}
        onBlur={_onBlur}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        aria-required={required}
        aria-invalid={shouldShowValidityIndication ? !isValid : undefined}
        maxLength={maxLength === null ? undefined : maxLength}
        disabled={isDisabled}
        {...getAriaAttributes(ariaAttributes)}
      ></textarea>
      <InlineErrorMessage
        errorMessageType={errorMessageType}
        errorMessage={inputRef.current?.validationMessage}
        shouldShowValidityIndication={shouldShowValidityIndication}
        translations={translations}
        componentViewMode={componentViewMode}
      />
    </div>
  );
};

export default React.forwardRef(TextAreaInputBase);
