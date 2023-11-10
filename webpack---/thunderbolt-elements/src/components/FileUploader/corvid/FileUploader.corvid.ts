import {
  composeSDKFactories,
  withValidation,
  reportError,
  messages,
  reportWarning,
  FileType,
  getFileDataByType,
  labelPropsSDKFactory,
  createRequiredPropsSDKFactory,
  createValidationPropsSDKFactory,
  focusPropsSDKFactory,
  disablePropsSDKFactory,
  createElementPropsSDKFactory,
  changePropsSDKFactory,
  createStylePropsSDKFactory,
  toJSONBase,
  composeValidators,
  createInputValidator,
  InputValidator,
  validateRequiredArray,
  getValidationData,
} from '@wix/editor-elements-corvid-utils';
import { createComponentSDKModel } from '@wix/editor-elements-integrations/corvid';
import {
  FileInfo,
  IFileUploaderImperativeActions,
  IFileUploaderOwnSDKFactory,
  IFileUploaderProps,
  IFileUploaderSDK,
  LegacyFileInfo,
  VeloFileMetaData,
} from '../FileUploader.types';
import { GeneralErrorTranslation } from '../constants';
import { validateNumFiles } from './validators/validateNumFiles';
import { validateFile } from './validators/validateFile';
import { validateUploadDone } from './validators/validateUploadDone';
import {
  parseMediaServerErrorKey,
  FailedUploadResponse,
  getErrorObject,
  getFileInfo,
  getWixCodeURI,
  isValidFileType,
  startFileUpload,
  SuccessfulUploadResponse,
  onValidate,
  startUploadDeprecationErrorObject,
  getNewPromiseResolveReject,
  filesUploadInProgressErrorObject,
  allSettled,
  generalErrorObject,
  supportsMultipleFiles,
} from './utils';
import { defaultState } from './constants';

type ResolveFileArgs = FileInfo;
type ResolveFileFn = (resolveWith: ResolveFileArgs) => void;
type RejectFileArgs =
  | {
      type: 'client';
      reason: {
        errorCode: number;
        errorDescription: string;
      };
      shouldFailUploadStatus: boolean;
    }
  | {
      type: 'server';
      reason: {
        errorCode: number;
        errorDescription: string;
      };
      errorInfo: {
        key: string;
        message: string;
      };
      shouldFailUploadStatus: boolean;
    };
type RejectFileFn = (rejectWith: RejectFileArgs) => void;

const fileUploaderValidator: InputValidator<
  IFileUploaderProps,
  IFileUploaderImperativeActions
> = createInputValidator(
  composeValidators<IFileUploaderProps>([
    validateRequiredArray,
    validateNumFiles,
    validateFile,
    validateUploadDone,
  ]),
);

fileUploaderValidator.onValidate(onValidate);

const requiredPropsSDKFactory = createRequiredPropsSDKFactory(
  fileUploaderValidator,
);
const validationPropsSDKFactory = createValidationPropsSDKFactory(
  fileUploaderValidator,
);

const stylePropsSDKFactory = createStylePropsSDKFactory({
  BackgroundColor: true,
  BorderColor: true,
  BorderWidth: true,
  BorderRadius: true,
  TextColor: true,
});

const _ownSDKFactory: IFileUploaderOwnSDKFactory = api => {
  const {
    handlers,
    props,
    setProps,
    compRef,
    registerEvent,
    metaData,
    createSdkState,
    platformUtils,
  } = api;
  const [, setState] = createSdkState(defaultState);
  const { essentials } = platformUtils;
  const fedopsLogger = essentials.createFedopsLogger('input-elements');

  let rejectCallback: ((reason: any) => void) | null;

  const rejectCurrentUpload = ({
    reason,
    shouldFailUploadStatus,
  }: RejectFileArgs) => {
    if (shouldFailUploadStatus) {
      setProps({ uploadStatus: 'Failed' });

      fileUploaderValidator.validate({
        showValidityIndication: true,
        viewerSdkAPI: api,
      });
    }

    if (rejectCallback) {
      rejectCallback(reason);
      rejectCallback = null;
    }
  };

  registerEvent('onChange', () => {
    if (!props.value.length) {
      setState({ uploadServerError: null });
    }
  });

  fileUploaderValidator.validate({
    viewerSdkAPI: api,
    showValidityIndication: false,
  });

  const generateUpdateFileUploadStatus =
    (fileIndex: number) =>
    ({
      successInfo,
      failureInfo,
    }: {
      successInfo?: ResolveFileArgs;
      failureInfo?: RejectFileArgs;
    }) => {
      const newValue = [...api.props.value];

      if (successInfo) {
        newValue[fileIndex] = {
          ...newValue[fileIndex],
          fileInfo: successInfo,
          uploadStatus: 'Done',
        };
      } else if (failureInfo) {
        if (failureInfo.type === 'server') {
          newValue[fileIndex] = {
            ...newValue[fileIndex],
            fileInfo: null,
            valid: false,
            validityInfo: {
              invalidKey: parseMediaServerErrorKey(failureInfo.errorInfo.key),
              invalidInfo: failureInfo.errorInfo.message,
            },
            uploadStatus: 'Failed',
          };
        } else {
          const reason = failureInfo.reason;
          newValue[fileIndex] = {
            ...newValue[fileIndex],
            fileInfo: null,
            valid: false,
            validityInfo: {
              invalidKey: GeneralErrorTranslation.key,
              invalidInfo:
                reason instanceof Error
                  ? reason.message
                  : reason.errorDescription,
            },
            uploadStatus: 'Failed',
          };
        }
      } else {
        newValue[fileIndex] = {
          ...newValue[fileIndex],
          fileInfo: null,
          uploadStatus: 'Started',
        };
      }

      setProps({ value: newValue });
    };

  const onSuccessfulUpload =
    ({
      resolveForFile,
      rejectForFile,
      setFirstUploadError,
      updateFileUploadStatus,
    }: {
      resolveForFile: ResolveFileFn;
      rejectForFile: RejectFileFn;
      setFirstUploadError: (error: RejectFileArgs) => void;
      updateFileUploadStatus: ReturnType<typeof generateUpdateFileUploadStatus>;
    }) =>
    (uploadResponse: SuccessfulUploadResponse) => {
      let resolvedValue: ResolveFileArgs | null = null;
      let rejectedValue: RejectFileArgs | null = null;

      if (uploadResponse) {
        const fileData = getFileDataByType(props.fileType, uploadResponse);

        try {
          const url = getWixCodeURI(fileData);
          resolvedValue = getFileInfo(fileData.media_type, url);
        } catch (error) {
          rejectedValue = {
            type: 'client',
            reason: generalErrorObject,
            shouldFailUploadStatus: true,
          };
        }
      } else {
        rejectedValue = {
          type: 'client',
          reason: generalErrorObject,
          shouldFailUploadStatus: true,
        };
      }

      if (resolvedValue) {
        updateFileUploadStatus({ successInfo: resolvedValue });
        return resolveForFile(resolvedValue);
      } else if (rejectedValue) {
        updateFileUploadStatus({ failureInfo: rejectedValue });
        setFirstUploadError(rejectedValue);
        return rejectForFile(rejectedValue);
      }
    };

  const onFailedUpload =
    ({
      rejectForFile,
      setFirstUploadError,
      updateFileUploadStatus,
    }: {
      rejectForFile: RejectFileFn;
      setFirstUploadError: (error: RejectFileArgs) => void;
      updateFileUploadStatus: ReturnType<typeof generateUpdateFileUploadStatus>;
    }) =>
    (uploadResponse: FailedUploadResponse) => {
      const reason = {
        errorCode: uploadResponse.error_code,
        errorDescription: uploadResponse.error_description,
      };

      const rejectWith = {
        type: 'server',
        reason,
        errorInfo: uploadResponse.error_info,
        shouldFailUploadStatus: true,
      } as const;
      setFirstUploadError(rejectWith);
      updateFileUploadStatus({ failureInfo: rejectWith });
      return rejectForFile(rejectWith);
    };

  const startUploadingFiles = (fileList: Iterable<any> | ArrayLike<any>) => {
    const uploadPromises: Array<Promise<ResolveFileArgs>> = [];

    const { promise: setFirstUploadErrorPromise, reject: setFirstUploadError } =
      getNewPromiseResolveReject<any, RejectFileArgs>();

    setFirstUploadErrorPromise.catch((error: RejectFileArgs) => {
      if (error.type === 'server') {
        setState({ uploadServerError: error.reason.errorDescription });
      } else {
        setState({ uploadServerError: null });
      }
    });

    for (const { file, idx } of Array.from(fileList).map((item, index) => ({
      file: item,
      idx: index,
    }))) {
      uploadPromises.push(
        new Promise(async (resolveForFile, rejectForFile) => {
          if (props.value[idx].uploadStatus !== 'Done') {
            const updateFileUploadStatus = generateUpdateFileUploadStatus(idx);
            updateFileUploadStatus({});
            try {
              await startFileUpload({
                fileType: props.fileType,
                handlers,
                file,
                onFailedUpload: onFailedUpload({
                  rejectForFile,
                  setFirstUploadError,
                  updateFileUploadStatus,
                }),
                onSuccessfulUpload: onSuccessfulUpload({
                  resolveForFile,
                  rejectForFile,
                  setFirstUploadError,
                  updateFileUploadStatus,
                }),
              });
            } catch (error) {
              const failureInfo = {
                type: 'client',
                reason: generalErrorObject,
                shouldFailUploadStatus: true,
              } as const;
              updateFileUploadStatus({ failureInfo });
              setFirstUploadError(failureInfo);
              rejectForFile(failureInfo);
            }
          } else {
            resolveForFile(props.value[idx].fileInfo as FileInfo);
          }
        }),
      );
    }

    return uploadPromises;
  };

  const createUploadFilesPromise = (): Promise<Array<FileInfo>> => {
    return new Promise(async (resolve, reject) => {
      fedopsLogger.interactionStarted('upload-files');
      fileUploaderValidator.validate({
        viewerSdkAPI: api,
      });

      rejectCallback = reject;

      const fileList = await compRef.getFiles();
      if (!fileList.length || props.isInvalidToUpload) {
        return rejectCurrentUpload({
          type: 'client',
          reason: getErrorObject(getValidationData(api), props),
          shouldFailUploadStatus: false,
        });
      }

      setProps({ uploadStatus: 'Started' });

      const uploadPromises = startUploadingFiles(fileList);

      let uploadedFiles: Array<ResolveFileArgs> | undefined;
      let uploadedFilesError: RejectFileArgs | undefined;
      try {
        uploadedFiles = await Promise.all(uploadPromises);
      } catch (error: any) {
        uploadedFilesError = error;
      }

      await allSettled(uploadPromises);

      if (uploadedFiles) {
        setProps({ uploadStatus: 'Done' });
      }

      fileUploaderValidator.validate({
        viewerSdkAPI: api,
      });

      if (uploadedFiles) {
        fedopsLogger.interactionEnded('upload-files');
        resolve(uploadedFiles);
      } else if (uploadedFilesError) {
        rejectCurrentUpload(uploadedFilesError);
      }

      rejectCallback = null;
    });
  };

  const uploadFilesImp = (): Promise<Array<FileInfo>> => {
    if (props.uploadStatus === 'Started' || rejectCallback) {
      return Promise.reject(filesUploadInProgressErrorObject);
    }

    return createUploadFilesPromise();
  };

  const sdkProps = {
    get buttonLabel() {
      return props.buttonLabel;
    },
    set buttonLabel(_buttonLabel) {
      const buttonLabel = _buttonLabel || '';
      setProps({ buttonLabel });
    },
    get fileLimit() {
      return props.numFilesLimit;
    },
    set fileLimit(fileLimit) {
      if (!supportsMultipleFiles(props.fileType)) {
        reportError(
          messages.invalidFileTypeForFileLimit({
            propertyName: 'fileLimit',
          }),
        );
        return;
      }

      setProps({
        numFilesLimit: fileLimit,
      });

      fileUploaderValidator.validate({
        viewerSdkAPI: api,
        showValidityIndication: true,
      });
    },
    get fileType() {
      return props.fileType;
    },
    set fileType(_fileType) {
      const fileType = (_fileType.charAt(0).toUpperCase() +
        _fileType.slice(1).toLowerCase()) as FileType;

      let propsToSet: Partial<IFileUploaderProps> = { fileType };

      if (!supportsMultipleFiles(fileType)) {
        propsToSet = {
          fileType,
          numFilesLimit: 1,
        };
      }

      setProps(propsToSet);

      fileUploaderValidator.validate({
        viewerSdkAPI: api,
        showValidityIndication: true,
      });
    },
    get value(): Array<VeloFileMetaData> {
      return props.value.map(({ name, size, valid, validityInfo }) => ({
        name,
        size,
        valid,
        validationMessage: validityInfo.invalidInfo,
      }));
    },
    set value(_value) {
      reportError(
        messages.onlyGetter({
          compType: 'UploadButton',
          propertyName: 'value',
        }),
      );
    },

    async startUpload(): Promise<LegacyFileInfo> {
      reportWarning(
        'startUpload is deprecated. Please use uploadFiles instead.',
      );

      if (props.numFilesLimit && props.numFilesLimit > 1) {
        throw startUploadDeprecationErrorObject;
      }

      const uploadedFile = (await uploadFilesImp())[0];

      const addKeyToObject = <T extends string, U>(
        key: T,
        value: U,
      ): { [key in T]: U } | {} =>
        value !== undefined ? { [key]: value } : {};

      return {
        url: uploadedFile.fileUrl,
        ...addKeyToObject('mediaId', uploadedFile.fileName),
        ...addKeyToObject('title', uploadedFile.originalFileName),
        ...addKeyToObject('width', uploadedFile.width),
        ...addKeyToObject('height', uploadedFile.height),
        ...addKeyToObject('duration', uploadedFile.duration),
      };
    },

    uploadFiles: uploadFilesImp,

    reset() {
      setProps({
        value: [],
        uploadStatus: 'Not_Started',
        shouldShowValidityIndication: false,
      });
      setState(defaultState);

      compRef.resetFiles();

      const rejectReason = {
        errorCode: -1,
        errorDescription: 'Upload Reset',
      };

      rejectCurrentUpload({
        type: 'client',
        reason: rejectReason,
        shouldFailUploadStatus: false,
      });

      fileUploaderValidator.validate({
        viewerSdkAPI: api,
      });
    },

    get type() {
      return '$w.UploadButton';
    },

    toJSON() {
      const { required } = props;
      const { value, buttonLabel, fileType, startUpload, uploadFiles, reset } =
        sdkProps;
      return {
        ...toJSONBase(metaData),
        type: '$w.UploadButton',
        required,
        value,
        buttonLabel,
        fileType,
        startUpload,
        uploadFiles,
        reset,
      };
    },
  };

  return sdkProps;
};

const customRules = {
  fileType: [isValidFileType],
};

const ownSDKFactory = withValidation(
  _ownSDKFactory,
  {
    type: ['object'],
    properties: {
      buttonLabel: {
        type: ['string', 'nil'],
        warnIfNil: true,
      },
      fileType: {
        type: ['string'],
      },
      fileLimit: {
        type: ['number'],
        minimum: 1,
        maximum: 30,
      },
    },
  },
  customRules,
);
const elementPropsSDKFactory = createElementPropsSDKFactory();
export const sdk = composeSDKFactories<IFileUploaderProps, IFileUploaderSDK>([
  elementPropsSDKFactory,
  requiredPropsSDKFactory,
  validationPropsSDKFactory,
  focusPropsSDKFactory,
  changePropsSDKFactory,
  disablePropsSDKFactory,
  stylePropsSDKFactory,
  labelPropsSDKFactory,
  ownSDKFactory,
]);

export default createComponentSDKModel(sdk);
