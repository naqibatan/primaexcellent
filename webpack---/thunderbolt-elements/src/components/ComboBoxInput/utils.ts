import {
  LogicalAlignment,
  parseValueWithUnit,
} from '@wix/editor-elements-common-utils';
import { ComboBoxInputOption } from '@wix/thunderbolt-components';
import { TextPaddingCssVars } from './ComboBoxInput.types';

export const isOptionWithSelectedText = (
  options: Array<ComboBoxInputOption>,
  optionValue: string,
) => {
  const selectedText = options.find(
    option => option.value === optionValue,
  )?.selectedText;

  return selectedText !== null && selectedText !== undefined;
};

export const noop = () => {};

export const calculateElemWidth = (elem: HTMLElement) =>
  elem.getBoundingClientRect().width;

export const filterOptionsByQuery = (
  filterQuery: string,
  options: Array<ComboBoxInputOption>,
) => {
  return options
    .filter(option =>
      option.text.toLowerCase().includes(filterQuery.toLowerCase()),
    )
    .sort((prev, next) => {
      if (prev.text.toLowerCase().startsWith(filterQuery.toLowerCase())) {
        return -1;
      }
      if (next.text.toLowerCase().startsWith(filterQuery.toLowerCase())) {
        return 1;
      }
      return 0;
    });
};

export const optionsMapper = (options: Array<ComboBoxInputOption>) => {
  return options.map((option: ComboBoxInputOption) => ({
    label: option.text,
    value: option.value,
  }));
};

const TEXT_PADDING_LIMIT = 45;

type TextPaddingCssVarsNumeric = {
  [varName in keyof TextPaddingCssVars]: number;
};

export const getTextPadding = (
  alignment: LogicalAlignment,
  textPadding: number | string,
): TextPaddingCssVarsNumeric => {
  const { value } = parseValueWithUnit(String(textPadding), {
    fallbackValue: { value: 0, unit: 'px' },
  });
  const isCenter = alignment === 'center';

  if (isCenter) {
    return {
      '--textPadding_start': TEXT_PADDING_LIMIT,
      '--textPadding_end': TEXT_PADDING_LIMIT,
    };
  }

  return {
    '--textPadding_start': value,
    '--textPadding_end': TEXT_PADDING_LIMIT,
  };
};
