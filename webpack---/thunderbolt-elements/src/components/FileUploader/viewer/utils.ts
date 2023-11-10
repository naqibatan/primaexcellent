import {
  FileType,
  fileTypeToBaseFileType,
} from '@wix/editor-elements-corvid-utils';
import {
  Direction,
  FlexDirection,
  LogicalAlignment,
  parseValueWithUnit,
} from '@wix/editor-elements-common-utils';
import { FileMetaData } from '../FileUploader.types';
import { getFileExtension, getMaxFileSize } from '../corvid/utils';
import { POPPERS_WRAPPER_ID, testIds } from '../constants';

export const createPoppersWrapperInDOM = (): HTMLElement => {
  let poppersWrapperEl = document.getElementById(POPPERS_WRAPPER_ID);
  if (!poppersWrapperEl) {
    poppersWrapperEl = document.createElement('div');
    poppersWrapperEl.setAttribute('data-testid', testIds.poppersWrapper);
    poppersWrapperEl.setAttribute('id', POPPERS_WRAPPER_ID);
    document.body.appendChild(poppersWrapperEl);
  }
  return poppersWrapperEl;
};
export const removePoppersWrapperFromDOM = (el?: HTMLElement) => {
  el && el.children.length <= 1 && el.remove();
};

export const translationKeyToPlaceholderData: {
  [key: string]: {
    getValueToReplace: (file: FileMetaData, fileType?: FileType) => string;
    placeholder: string;
  };
} = {
  'upload-button.wpm_error.unsupported_file_extension': {
    getValueToReplace: file => getFileExtension(file.name),
    placeholder: '{extension}',
  },
  'upload-button.wpm_error.mime_type_mismatch': {
    getValueToReplace: file => getFileExtension(file.name),
    placeholder: '{extension}',
  },
  'upload-button.wpm_error.file_size_exceeded_limit': {
    getValueToReplace: (file, fileType) =>
      getMaxFileSize(fileTypeToBaseFileType(fileType as FileType, file.name)),
    placeholder: '{sizeLimit}',
  },
  '': {
    getValueToReplace: () => '',
    placeholder: '',
  },
};

export const invalidKeyToTranslationKey: {
  [key: string]:
    | 'wpm_error.file_size_exceeded_limit'
    | 'wpm_error.unsupported_file_extension';
} = {
  fileSizeExceedsLimit: 'wpm_error.file_size_exceeded_limit',
  fileTypeNotAllowed: 'wpm_error.unsupported_file_extension',
};

export const parseErrorMessage = (
  translation: string,
  placeholder: string,
  value: string,
) => translation.replace(placeholder, value);

export const hasPlaceholder = (translation: string) => {
  const placeholders = ['{extension}', '{sizeLimit}'];

  return !!placeholders.find(placeholder => translation.includes(placeholder));
};

export const getNumberOfFilesLinkId = (parentCompId: string) =>
  `number-of-files-link_${parentCompId}`;

export const getFileNameId = ({
  parentCompId,
  fileIndex,
}: {
  parentCompId: string;
  fileIndex: number;
}) => `file-name_${fileIndex}_${parentCompId}`;

export const getFileNameErrorTooltipId = (fileNameId: string) =>
  `${fileNameId}_tooltip`;

export const getFallbackIconPosition = (
  buttonAlignment: Direction,
): FlexDirection => (buttonAlignment === 'ltr' ? 'row' : 'row-reverse');

export const getButtonLabelPaddingsValues = ({
  align,
  padding,
}: {
  align: LogicalAlignment;
  padding: string | number;
}): Record<string, number> => {
  const { value } = parseValueWithUnit(String(padding), {
    fallbackValue: { value: 0, unit: 'px' },
  });
  switch (align) {
    case 'center':
      return {
        '--buttonLabelPadding_start': 10,
        '--buttonLabelPadding_end': 10,
      };
    case 'start':
      return {
        '--buttonLabelPadding_start': value,
        '--buttonLabelPadding_end': 0,
      };
    default:
      return {
        '--buttonLabelPadding_start': 0,
        '--buttonLabelPadding_end': value,
      };
  }
};
