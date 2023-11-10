import type { ValueValidator } from '@wix/editor-elements-corvid-utils';
import {
  addErrorToValidationDataAndKeepMessage,
  getValidationMessage,
} from '@wix/editor-elements-corvid-utils';
import {
  UploadStatus,
  IFileUploaderProps,
  IFileUploaderSDKState,
} from '../../FileUploader.types';
import { defaultState } from '../constants';

const getFileMissingMessage = (
  uploadStatus: UploadStatus,
  state: Readonly<IFileUploaderSDKState>,
): string => {
  if (uploadStatus === 'Failed') {
    return state.uploadServerError || getValidationMessage('fileNotUploaded');
  }

  return getValidationMessage('fileNotUploaded');
};

export const validateUploadDone: ValueValidator<
  Pick<IFileUploaderProps, 'uploadStatus' | 'required'>
> = ({ uploadStatus, required }, validationData, { createSdkState }) => {
  const isAlreadyInvalid = !validationData.validity.valid;

  if ((!required && uploadStatus !== 'Failed') || isAlreadyInvalid) {
    return validationData;
  }

  const [state] = createSdkState(defaultState);

  return uploadStatus === 'Done'
    ? validationData
    : addErrorToValidationDataAndKeepMessage(
        validationData,
        'fileNotUploaded',
        getFileMissingMessage(uploadStatus, state),
      );
};
