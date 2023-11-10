import type {
  FileType,
  BaseFileType,
  FileValidityKey,
  UploadedFileData,
  MediaManagerMediaType,
  ValidationData,
  OnValidateArgs,
} from '@wix/editor-elements-corvid-utils';
import {
  reportError,
  messages,
  createMediaSrc,
  parseMediaSrc,
  fileTypeToMediaType,
  getValidationMessage,
  fileTypeToBaseFileType,
  mediaTypeToMediaSrcType,
} from '@wix/editor-elements-corvid-utils';
import {
  File,
  FileMetaData,
  IFileUploaderImperativeActions,
  IFileUploaderProps,
  FileInfo,
  MediaServerErrorKey,
  GeneralFileUploadErrorKey,
} from '../FileUploader.types';

import {
  GeneralErrorTranslation,
  MediaServerErrorKeysTranslationMapping,
} from '../constants';

type ProcessedFileData = UploadedFileData & {
  uri?: string;
  title?: string;
  filename?: string;
  posterUri?: string;
  duration?: number;
};

export type SuccessfulUploadResponse = UploadedFileData | undefined;
export type FailedUploadResponse = {
  error_code: number;
  error_description: string;
  error_info: {
    key: string;
    message: string;
  };
};

const noFileToUploadMessage = 'No files found';

export const startUploadDeprecationErrorObject = {
  errorCode: -7754,
  errorDescription:
    'startUpload is deprecated, to upload multiple files please use the uploadFiles() function.',
};

export const filesUploadInProgressErrorObject = {
  errorCode: -7755,
  errorDescription: 'files upload in progress.',
};

export const generateNumFilesSelectedErrorObject = (
  numOfSelectedFiles: number,
  numberOfExpectedFiles: number,
) => ({
  errorCode: -7753,
  errorDescription: `There are ${numOfSelectedFiles} files selected, please select up to ${numberOfExpectedFiles}`,
});

export const generalErrorObject = {
  errorCode: -7756,
  errorDescription: 'Unexpected error occurred.',
};

export const isValidFileType = (_fileType: string) => {
  const fileType =
    _fileType.charAt(0).toUpperCase() + _fileType.slice(1).toLowerCase();
  const validFileTypes = ['Image', 'Document', 'Video', 'Audio', 'Gallery'];
  if (!validFileTypes.includes(fileType)) {
    reportError(
      messages.invalidEnumValueMessage({
        functionName: 'fileType',
        propertyName: 'fileType',
        value: _fileType,
        enum: validFileTypes,
        index: undefined,
      }),
    );
    return false;
  }
  return true;
};

export const getFileExtension = (fileName: string): string => {
  const match = /\.(\w+)$/.exec(fileName);
  return ((match && match[1]) || '').toUpperCase();
};

export const fileSizes = {
  Image: 25000000,
  Document: 1000000000,
  Video: 1000000000,
  Audio: 50000000,
} as const;

const KB = 1000;
const MB = KB * 1000;
const GB = MB * 1000;

export const getMaxFileSize = (fileType: BaseFileType): string => {
  const bytes = fileSizes[fileType];
  if (bytes > 999999999) {
    return `${bytes / GB} GB`;
  }
  if (bytes > 999999) {
    return `${bytes / MB} MB`;
  }
  return `${bytes / KB} KB`;
};

export const getFileValidityValidationMessage = (
  validityKey: FileValidityKey,
  fileName: string,
  fileType: FileType,
): string => {
  switch (validityKey) {
    case 'fileTypeNotAllowed':
      return getValidationMessage(
        'fileTypeNotAllowed',
        getFileExtension(fileName),
      );

    case 'fileSizeExceedsLimit':
      return getValidationMessage(
        'fileSizeExceedsLimit',
        getMaxFileSize(fileTypeToBaseFileType(fileType, fileName)),
      );

    default:
      return '';
  }
};

export const getWixCodeURI = (fileData: ProcessedFileData): string => {
  const mediaSrc = createMediaSrc({
    type: mediaTypeToMediaSrcType[fileData.media_type],
    mediaId: fileData.uri,
    title: fileData.filename,
    height: fileData.height,
    width: fileData.width,
    posterId: fileData.posterUri,
    duration: fileData.duration,
  });

  if (mediaSrc.error || !mediaSrc.item) {
    throw new Error(mediaSrc.error || 'No File Url Generated');
  }

  return mediaSrc.item;
};

export const getFileInfo = (
  mediaType: MediaManagerMediaType,
  url: string,
): FileInfo => {
  switch (mediaType) {
    case 'picture':
      const imageMediaSrc = parseMediaSrc(url, 'image');
      if (imageMediaSrc.error) {
        throw new Error(imageMediaSrc.error);
      }
      return {
        fileUrl: url,
        fileName: imageMediaSrc.mediaId,
        originalFileName: imageMediaSrc.title,
        width: imageMediaSrc.width,
        height: imageMediaSrc.height,
      };
    case 'document':
      const documentMediaSrc = parseMediaSrc(url, 'document');
      if (documentMediaSrc.error) {
        throw new Error(documentMediaSrc.error);
      }
      return {
        fileUrl: url,
        fileName: documentMediaSrc.mediaId,
        originalFileName: documentMediaSrc.title,
      };
    case 'video':
      const videoMediaSrc = parseMediaSrc(url, 'video');
      if (videoMediaSrc.error) {
        throw new Error(videoMediaSrc.error);
      }
      return {
        fileUrl: url,
        fileName: videoMediaSrc.mediaId,
        originalFileName: videoMediaSrc.title,
        width: videoMediaSrc.width,
        height: videoMediaSrc.height,
      };
    case 'music':
      const musicMediaSrc = parseMediaSrc(url, 'audio');
      if (musicMediaSrc.error) {
        throw new Error(musicMediaSrc.error);
      }
      return {
        fileUrl: url,
        fileName: musicMediaSrc.mediaId,
        duration: musicMediaSrc.duration,
        originalFileName: musicMediaSrc.title,
      };
    default:
      throw new TypeError(`Unknown media_type "${mediaType}"`);
  }
};

const getErrorCode = (validity: ValidationData['validity']) => {
  if (validity.exceedsFilesLimit) {
    return -7753;
  }
  if (validity.fileTypeNotAllowed) {
    return -7751;
  }
  if (validity.fileSizeExceedsLimit) {
    return -7752;
  }

  return -1;
};

export const getErrorDescription = (
  validationData: ValidationData,
  props: IFileUploaderProps,
  errorCode: number,
) => {
  const filesValidationInfo =
    validationData.type === 'FileUploader'
      ? validationData.filesValidationInfo
      : [];

  switch (errorCode) {
    case -1:
      return noFileToUploadMessage;

    case -7751:
      return getFileValidityValidationMessage(
        'fileTypeNotAllowed',
        props.value[
          filesValidationInfo.findIndex(key => key === 'fileTypeNotAllowed')
        ]?.name || '',
        props.fileType,
      );
    case -7752:
      return getFileValidityValidationMessage(
        'fileSizeExceedsLimit',
        props.value[
          filesValidationInfo.findIndex(key => key === 'fileSizeExceedsLimit')
        ]?.name || '',
        props.fileType,
      );

    case -7753:
      return generateNumFilesSelectedErrorObject(
        props.value.length,
        props.numFilesLimit,
      ).errorDescription;
    default:
      return validationData.validationMessage;
  }
};

export const getErrorObject = (
  validationData: ValidationData,
  props: IFileUploaderProps,
) => {
  const errorCode = getErrorCode(validationData.validity);
  const errorDescription = getErrorDescription(
    validationData,
    props,
    errorCode,
  );

  return {
    errorCode,
    errorDescription,
  };
};

export const startFileUpload = async ({
  fileType,
  handlers,
  file,
  onFailedUpload,
  onSuccessfulUpload,
}: {
  fileType: FileType;
  handlers: any;
  file: File;
  onFailedUpload: (uploadResponse: FailedUploadResponse) => void;
  onSuccessfulUpload: (uploadResponse: SuccessfulUploadResponse) => void;
}) => {
  const mediaAuthToken = (await handlers.getMediaAuthToken()) || '';
  const mediaType = fileTypeToMediaType(fileType, file.name);

  const getUploadUrlResponse = await getUploadUrl({
    file,
    mediaAuthToken,
    mediaType,
  });
  const getUploadUrlResponseJson = await getUploadUrlResponse.json();
  if (!getUploadUrlResponse.ok) {
    return onFailedUpload(getUploadUrlResponseJson);
  }

  const uploadFileToMediaResponse = await uploadFileToMediaManager({
    getUploadUrlResponseJson,
    file,
  });
  const uploadFileToMediaResponseJson = await uploadFileToMediaResponse.json();
  if (!uploadFileToMediaResponse.ok) {
    return onFailedUpload(uploadFileToMediaResponseJson);
  }

  return onSuccessfulUpload(uploadFileToMediaResponseJson[0]);
};

const getUploadUrl = ({
  file,
  mediaType,
  mediaAuthToken,
}: {
  file: File;
  mediaType: MediaManagerMediaType;
  mediaAuthToken: string;
}) => {
  const getUrl = `https://files.wix.com/site/media/files/upload/url?parent_folder_id=visitor-uploads&media_type=${mediaType}&file_name=${encodeURIComponent(
    file.name,
  )}&mime_type=${encodeURIComponent(file.type)}`;

  return fetch(getUrl, {
    method: 'GET',
    headers: {
      Authorization: `APP ${mediaAuthToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};

const addQueryParamsToURL = (
  url: string,
  params: { [key: string]: string },
) => {
  const queryParams = Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');

  return url + (url.indexOf('?') === -1 ? '?' : '&') + queryParams;
};

const uploadFileToMediaManager = ({
  getUploadUrlResponseJson,
  file,
}: {
  getUploadUrlResponseJson: { upload_token: string; upload_url: string };
  file: File;
}) => {
  const params = {
    filename: file.name,
    mime_type: file.type,
  };

  return fetch(
    addQueryParamsToURL(getUploadUrlResponseJson.upload_url, params),
    {
      method: 'PUT',
      body: file,
      headers: {
        'content-type': file.type || 'application/octet-stream',
      },
    },
  );
};

export const onValidate = ({
  viewerSdkAPI: api,
  validationDataResult,
}: OnValidateArgs<IFileUploaderProps, IFileUploaderImperativeActions>) => {
  if (
    validationDataResult.type === 'FileUploader' &&
    api.props.uploadStatus === 'Not_Started'
  ) {
    const isInvalidToUpload = Object.entries(
      validationDataResult.validity,
    ).some(
      ([key, value]) => value && key !== 'valid' && key !== 'fileNotUploaded',
    );

    const filesValidationInfo = validationDataResult.filesValidationInfo;
    const newValue: Array<FileMetaData> = api.props.value.map(
      (file: FileMetaData, idx: number) => ({
        name: file.name,
        size: file.size,
        valid: !filesValidationInfo[idx],
        validityInfo: {
          invalidKey: filesValidationInfo[idx],
          invalidInfo: getFileValidityValidationMessage(
            filesValidationInfo[idx],
            file.name,
            api.props.fileType,
          ),
        },
        fileInfo: file.fileInfo,
        uploadStatus: file.uploadStatus,
      }),
    );
    api.setProps({
      value: newValue,
      isInvalidToUpload,
      validationMessage: validationDataResult.validationMessage,
    });
  }
};

export const getNewPromiseResolveReject = <T, U>() => {
  let resolveMethod: (param: T) => void = () => '';
  let rejectMethod: (param: U) => void = () => '';

  const promise = new Promise<T>((resolve, reject) => {
    resolveMethod = resolve;
    rejectMethod = reject;
  });

  return { promise, resolve: resolveMethod, reject: rejectMethod };
};

export const parseMediaServerErrorKey = (
  key: string,
): MediaServerErrorKey | GeneralFileUploadErrorKey =>
  MediaServerErrorKeysTranslationMapping[key as MediaServerErrorKey]
    ? (key as MediaServerErrorKey)
    : GeneralErrorTranslation.key;

export const allSettled = (promisesArr: Array<Promise<any>>) =>
  Promise.all(
    promisesArr.map(
      promise =>
        new Promise<void>(resolve =>
          promise.then(() => resolve()).catch(() => resolve()),
        ),
    ),
  );

export const supportsMultipleFiles = (fileType: FileType) =>
  fileType === 'Image' ||
  fileType === 'Video' ||
  fileType === 'Gallery' ||
  fileType === 'Document';
