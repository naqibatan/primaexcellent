import * as React from 'react';
import classNames from 'clsx';
import {
  HAS_CUSTOM_FOCUS_CLASSNAME,
  useDomDirection,
} from '@wix/editor-elements-common-utils';
import {
  IFileNameProps,
  FileMetaData,
  MediaServerErrorTranslationKeys,
} from '../../FileUploader.types';
import { testIds } from '../../constants';
import { FileErrorIcon } from '../FileErrorIcon/FileErrorIcon';
import { CenterEllipsis } from '../CenterEllipsis/CenterEllipsis';
import SuccessIcon from '../assets/successIcon.svg';
import { Loader } from '../Loader/Loader';
import {
  getFileNameErrorTooltipId,
  hasPlaceholder,
  invalidKeyToTranslationKey,
  parseErrorMessage,
  translationKeyToPlaceholderData,
} from '../utils';
import { usePrevious } from '../../../../providers/usePrevious';
import style from './style/FileName.scss';

const getFileValidationMessage = (
  file: FileMetaData,
  fileType: IFileNameProps['fileType'],
  translations: IFileNameProps['translations'],
) => {
  if (!file.validityInfo.invalidKey) {
    return '';
  }

  const invalidKeyTranslationKey = `upload-button.${
    invalidKeyToTranslationKey[file.validityInfo.invalidKey] ||
    file.validityInfo.invalidKey
  }` as MediaServerErrorTranslationKeys;
  let translation =
    translations[invalidKeyTranslationKey] || file.validityInfo.invalidInfo;

  if (!translation) {
    translation = translations.generalError!;
  } else if (hasPlaceholder(translation)) {
    translation = parseErrorMessage(
      translation,
      translationKeyToPlaceholderData[invalidKeyTranslationKey].placeholder,
      translationKeyToPlaceholderData[
        invalidKeyTranslationKey
      ].getValueToReplace(file, fileType),
    );
  }

  return translation;
};

const noop = () => {};

export const FileName: React.FunctionComponent<IFileNameProps> = ({
  fileNameId,
  placeholder,
  file,
  shouldShowValidityIndication,
  onFileRemoval,
  onXIconKeyDown = noop,
  disabled,
  withCenterEllipsis = false,
  uploadStatus = 'Not_Started',
  withPopperBehaviour = false,
  isFixedPositionPopper = false,
  filesFont,
  translations,
  fileType,
  withSingleFileBehavior = false,
  setXIconElem = noop,
  virtualFocused = false,
  updateLiveRegion,
  disableFileNameXIconFocus = false,
  scopedClassName,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const isPlaceholder = !!placeholder;
  const fileName = placeholder || file?.name || '';
  const validationMessage = file
    ? getFileValidationMessage(file, fileType, translations)
    : '';
  const withErrorIndication =
    shouldShowValidityIndication && !!validationMessage;
  const fileWithIconClassName = classNames(style.fileWithIcon, {
    [style.errorIndication]: withErrorIndication,
    [style.placeholder]: isPlaceholder,
    [style.disabled]: disabled,
    [style.withoutNativeTooltip]: !withCenterEllipsis,
    [style.withPopperBehaviour]: withPopperBehaviour,
    [style.uploadNotStarted]:
      withPopperBehaviour &&
      uploadStatus === 'Not_Started' &&
      !validationMessage,
    [style.fixedPositionPopper]: isFixedPositionPopper,
    [style.focused]: virtualFocused || isFocused,
  });
  const { direction, directionRef } = useDomDirection<HTMLDivElement>();
  const filesFontOverride = filesFont
    ? ({ '--file_fnt': filesFont } as React.CSSProperties)
    : {};
  const isUploadingState = uploadStatus === 'Started';
  const isDoneUploadingState = uploadStatus === 'Done';

  const showErrorTooltip = withErrorIndication && !isPlaceholder;
  const shouldRenderErrorIcon = showErrorTooltip && !!validationMessage;

  const handleFileRemoval = (e: React.MouseEvent<HTMLElement>) => {
    e?.stopPropagation();
    onFileRemoval();
  };

  const handleXIconKeyDown = (e: React.KeyboardEvent) => {
    e?.stopPropagation();
    onXIconKeyDown(e);
  };

  const deleteFileDescription = `Delete File ${fileName}`;

  const prevUploadStatus = usePrevious(uploadStatus);
  React.useEffect(() => {
    if (
      prevUploadStatus &&
      prevUploadStatus !== uploadStatus &&
      uploadStatus === 'Done'
    ) {
      updateLiveRegion('File uploaded');
    }
  }, [prevUploadStatus, uploadStatus, updateLiveRegion]);

  return (
    <div
      id={fileNameId}
      className={fileWithIconClassName}
      data-testid={testIds.fileWithIcon}
      role={withPopperBehaviour ? 'menuitem' : undefined}
      ref={directionRef}
    >
      <div className={style.fileNameWrapper}>
        <div
          role={withSingleFileBehavior ? 'button' : undefined}
          tabIndex={
            withSingleFileBehavior && !disableFileNameXIconFocus ? 0 : undefined
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          ref={setXIconElem as React.LegacyRef<HTMLDivElement>}
          onKeyDown={handleXIconKeyDown}
          aria-label={
            withSingleFileBehavior ? deleteFileDescription : undefined
          }
          aria-describedby={
            withSingleFileBehavior && shouldRenderErrorIcon
              ? getFileNameErrorTooltipId(fileNameId)
              : undefined
          }
          className={classNames(style.xIcon, HAS_CUSTOM_FOCUS_CLASSNAME, {
            [style.isUploading]: isUploadingState,
            [style.uploadedSuccessfully]: isDoneUploadingState,
          })}
          data-testid={testIds.xIcon}
          onClick={handleFileRemoval}
        />
        {withPopperBehaviour ? (
          <span
            className={style.srOnly}
            data-testid={testIds.deleteFileDescSrOnly}
            aria-describedby={
              shouldRenderErrorIcon
                ? getFileNameErrorTooltipId(fileNameId)
                : undefined
            }
          >
            {deleteFileDescription}
          </span>
        ) : null}
        <div
          style={filesFontOverride}
          className={classNames(style.fileName, {
            [style.isUploading]: isUploadingState,
            [style.withPopperBehaviour]: withPopperBehaviour,
            [style.fileNameLtr]: !isPlaceholder,
          })}
          data-testid={testIds.fileName}
          title={fileName}
          aria-hidden="true"
        >
          {withCenterEllipsis ? (
            <CenterEllipsis content={fileName} />
          ) : (
            fileName
          )}
        </div>
      </div>
      {shouldRenderErrorIcon ? (
        <FileErrorIcon
          fileNameId={fileNameId}
          message={validationMessage}
          withSingleFileBehavior={withSingleFileBehavior}
          forceShowTooltip={virtualFocused || isFocused}
          scopedClassName={scopedClassName}
          direction={direction!}
        />
      ) : (
        <div
          className={classNames(style.uploadStatusIndicator, {
            [style.activeStatus]: uploadStatus !== 'Not_Started',
          })}
        >
          <Loader uploadStatus={uploadStatus} />
          <SuccessIcon
            data-testid={testIds.successIndication}
            className={classNames(style.successIcon, {
              [style.uploadedSuccessfully]: isDoneUploadingState,
            })}
          />
        </div>
      )}
    </div>
  );
};
