import type { ValidationData } from '@wix/editor-elements-corvid-utils';
import { addErrorToValidationDataAndKeepMessage } from '@wix/editor-elements-corvid-utils';
import { FileMetaData, UploadStatus } from '../../FileUploader.types';

export const validateNumFiles = (
  props: {
    value: Array<FileMetaData>;
    uploadStatus: UploadStatus;
    numFilesLimit: number;
  },
  validationData: ValidationData,
): ValidationData => {
  const { value, uploadStatus, numFilesLimit } = props;
  const uploadNotStarted = uploadStatus === 'Not_Started';

  if (!value) {
    return validationData;
  }

  return uploadNotStarted && value.length > numFilesLimit
    ? addErrorToValidationDataAndKeepMessage(
        validationData,
        'exceedsFilesLimit',
      )
    : validationData;
};
