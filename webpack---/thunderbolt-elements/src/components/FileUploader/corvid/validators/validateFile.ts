import type {
  FileType,
  BaseFileType,
  ValidationData,
  FileUploaderValidationData,
  FilesValidationInfo,
  FileValidityKey,
} from '@wix/editor-elements-corvid-utils';
import {
  fileTypeToBaseFileType,
  fileTypeMatchers,
  addErrorToValidationDataAndKeepMessage,
} from '@wix/editor-elements-corvid-utils';
import { FileMetaData, UploadStatus } from '../../FileUploader.types';
import { fileSizes, getFileValidityValidationMessage } from '../utils';

const isFileTypeValid = (fileType: BaseFileType, fileName: string) =>
  fileTypeMatchers[fileType].test(fileName);
const isFileSizeValid = (fileType: BaseFileType, fileSize: number) =>
  fileSize <= fileSizes[fileType];

const validateForFile = (
  fileData: FileMetaData,
  fileType: FileType,
  validationData: ValidationData,
) => {
  const fileName = fileData.name || '';
  let fileValidityKey: FileValidityKey = '';
  const currentFileType = fileTypeToBaseFileType(fileType, fileName);
  let updatedValidationData = validationData;

  if (!isFileTypeValid(currentFileType, fileName)) {
    updatedValidationData = addErrorToValidationDataAndKeepMessage(
      updatedValidationData,
      'fileTypeNotAllowed',
      getFileValidityValidationMessage(
        'fileTypeNotAllowed',
        fileName,
        currentFileType,
      ),
    );
    fileValidityKey = 'fileTypeNotAllowed';
  }

  if (!isFileSizeValid(currentFileType, fileData.size || 0)) {
    updatedValidationData = addErrorToValidationDataAndKeepMessage(
      updatedValidationData,
      'fileSizeExceedsLimit',
      getFileValidityValidationMessage(
        'fileSizeExceedsLimit',
        fileName,
        currentFileType,
      ),
    );

    if (!fileValidityKey) {
      fileValidityKey = 'fileSizeExceedsLimit';
    }
  }

  return { fileValidityKey, updatedValidationData };
};

export const validateFile = (
  props: {
    value: Array<FileMetaData>;
    uploadStatus: UploadStatus;
    fileType: FileType;
  },
  validationData: ValidationData,
): FileUploaderValidationData => {
  const { value, uploadStatus, fileType } = props;
  const filesData = value;
  const uploadNotStarted = uploadStatus === 'Not_Started';
  const filesValidationInfo: FilesValidationInfo = [];

  if (filesData && uploadNotStarted) {
    filesData.forEach(fileData => {
      const { fileValidityKey, updatedValidationData } = validateForFile(
        fileData,
        fileType,
        validationData,
      );

      validationData = updatedValidationData;
      filesValidationInfo.push(fileValidityKey);
    });
  }

  const fileUploaderValidationData: FileUploaderValidationData = {
    ...validationData,
    type: 'FileUploader' as const,
    filesValidationInfo,
  };

  return fileUploaderValidationData;
};
