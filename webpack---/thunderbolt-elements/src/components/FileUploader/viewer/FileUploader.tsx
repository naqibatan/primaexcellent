import * as React from 'react';
import classNames from 'clsx';
import * as browserUtils from '@wix/thunderbolt-commons/dist/deprecatedBrowserUtils';
import {
  acceptableFilesTypes,
  facebookAcceptableFileTypes,
} from '@wix/editor-elements-corvid-utils';
import {
  customCssClasses,
  keyCodes,
  getDataAttributes,
} from '@wix/editor-elements-common-utils';
import { FileMetaData, IFileUploaderProps } from '../FileUploader.types';
import { testIds } from '../constants';
import semanticClassNames from '../FileUploader.semanticClassNames';
import style from './style/FileUploader.scss';
import { FilesNameList } from './FilesNameList/FilesNameList';
import { NumberOfFilesLink } from './NumberOfFilesLink/NumberOfFilesLink';
import { getFileNameId } from './utils';

const noop = () => {};

const FileUploader: React.ForwardRefRenderFunction<any, IFileUploaderProps> = (
  props,
  ref,
) => {
  const {
    id,
    className,
    customClassNames = [],
    skin,
    label,
    buttonLabel,
    placeholderLabel,
    value,
    fileType,
    required,
    uploadStatus = 'Not_Started',
    isDisabled,
    shouldShowValidityIndication,
    isInvalidToUpload,
    filesFont,
    translations,
    validateValueAndShowIndication = noop,
    onChange = noop,
    onSelectedFilesChange = noop,
    onBlur = noop,
    onFocus = noop,
    onMouseEnter = noop,
    onMouseLeave = noop,
    numFilesLimit = 1,
    externallyOpenPopper,
    externallyClosePopper,
    disableFileNameXIconFocus,
    scopedClassName,
  } = props;
  const fileUploadRef = React.useRef<HTMLInputElement>(null);
  const uploadButtonRef = React.useRef<HTMLInputElement>(null);
  const selectedFileListRef = React.useRef<null | FileList>(null);
  const [acceptString, setAcceptString] = React.useState<string>();
  const [textBellowButtonElem, setTextBellowButton] =
    React.useState<HTMLElement | null>(null);
  const liveRegionRef = React.useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => ({
    focus() {
      uploadButtonRef.current?.focus();
    },
    blur() {
      uploadButtonRef.current?.blur();
    },
    setCustomValidity(message: string) {
      fileUploadRef.current?.setCustomValidity(message);
    },
    getFiles() {
      return selectedFileListRef.current || [];
    },
    resetFiles() {
      if (fileUploadRef.current) {
        fileUploadRef.current.value = '';
        selectedFileListRef.current = null;
      }
    },
  }));

  React.useEffect(() => {
    const { isFacebookApp, isInstagramApp, isIOS } = browserUtils;
    const { iOS, other } = facebookAcceptableFileTypes;

    const metaFileExtensions = isIOS(window) ? iOS : other;

    const acceptableFileExtensions =
      isFacebookApp(window) || isInstagramApp(window)
        ? metaFileExtensions
        : acceptableFilesTypes;

    setAcceptString(acceptableFileExtensions[fileType]);
  }, [fileType]);

  const isUploading = uploadStatus === 'Started';
  const uploadFailed = uploadStatus === 'Failed';
  const disabled = isUploading || !!isDisabled;
  const withErrorIndication =
    (isInvalidToUpload || uploadFailed) && shouldShowValidityIndication;

  const onUploadButtonClick = () => {
    if (!disabled) {
      fileUploadRef?.current?.click();
      uploadButtonRef?.current?.blur();
    }
  };

  const onUploadButtonKeyDown: React.KeyboardEventHandler = event => {
    const allowedKeys: Array<number> = [keyCodes.enter, keyCodes.space];
    if (allowedKeys.includes(event.keyCode)) {
      event.preventDefault();
      onUploadButtonClick();
    }
  };

  const onXIconKeyDown = (index: number, e: React.KeyboardEvent) => {
    const allowedKeys: Array<number> = [keyCodes.space, keyCodes.delete];
    if (allowedKeys.includes(e.keyCode)) {
      e.preventDefault();
      onFileRemoval(index);
    }
  };

  const _onFocus: React.FocusEventHandler = event => {
    if (!disabled) {
      onFocus(event);
    }
  };

  const _onBlur: React.FocusEventHandler = event => {
    if (!disabled) {
      onBlur(event);
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

  const removeFileFromRef = (indexToRemove: number) => {
    const FileListItems = (files: FileList | null) => {
      const filesObj = new DataTransfer();
      if (!files) {
        return null;
      }

      for (let i = 0, len = files.length; i < len; i++) {
        if (i !== indexToRemove) {
          filesObj.items.add(files[i]);
        }
      }
      return filesObj.files;
    };

    const selectedFiles = FileListItems(fileUploadRef.current!.files);
    fileUploadRef.current!.files = selectedFiles;
    selectedFileListRef.current = selectedFiles;
  };

  const onFileRemoval = (indexToRemove: number) => {
    if (isUploading) {
      return;
    }

    if (indexToRemove >= 0) {
      if (fileUploadRef.current) {
        const files = [...value];
        files.splice(indexToRemove, 1);
        onSelectedFilesChange(files);
        removeFileFromRef(indexToRemove);

        if (files.length === 0) {
          uploadButtonRef.current?.focus();
        }
        updateLiveRegion('File deleted');
      }
    } else {
      if (fileUploadRef.current) {
        fileUploadRef.current.value = '';
      }
      selectedFileListRef.current = null;
      onSelectedFilesChange([]);
      uploadButtonRef.current?.focus();
    }
    validateValueAndShowIndication();
    // onChange expects to get a full React event, but we rely on viewer platform the add target & context.
    onChange({ type: 'change', compId: id } as any);
  };

  const onFileSelectionChange = () => {
    if (fileUploadRef?.current?.files?.length) {
      // We use this FileList ref to keep selected files even after native file picker is closed.
      selectedFileListRef.current = fileUploadRef.current.files;
      const selectedFiles: Array<FileMetaData> = Array.from(
        fileUploadRef.current.files,
      ).map(file => ({
        name: file.name,
        size: file.size,
        valid: true,
        validityInfo: {
          invalidKey: '',
          invalidInfo: '',
        },
        fileInfo: null,
        uploadStatus: 'Not_Started',
      }));

      onSelectedFilesChange(selectedFiles);
      validateValueAndShowIndication();

      // onChange expects to get a full React event, but we rely on viewer platform the add target & context.
      onChange({ type: 'change', compId: id } as any);
      textBellowButtonElem?.focus();
    }
  };

  const rootClassName = classNames(
    style[skin],
    className,
    customCssClasses(semanticClassNames.root, ...customClassNames),
    {
      [style.hasLabel]: !!label,
      [style.hasButtonLabel]: !!buttonLabel,
      [style.hasPlaceholderLabel]: !!placeholderLabel,
      [style.required]: required,
    },
  );

  const uploadFileButtonClass = classNames(style.uploadFileButton, {
    [style.disabled]: disabled,
    [style.errorIndication]: withErrorIndication,
  });

  const updateLiveRegion = React.useCallback((liveRegionMessage: string) => {
    const liveRegionElem = liveRegionRef.current;
    if (liveRegionElem) {
      liveRegionElem.textContent = '';
      liveRegionElem.textContent = liveRegionMessage;
    }
  }, []);

  return (
    <div
      id={id}
      {...getDataAttributes(props)}
      className={rootClassName}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
    >
      <div
        className={style.srOnly}
        ref={liveRegionRef}
        data-testid={testIds.liveRegion}
        role="alert"
      ></div>
      {!!label && (
        <label className={style.label} htmlFor={`fileInput${id}`}>
          {label}
        </label>
      )}
      <div className={style.inputWithFiles}>
        <input
          type="file"
          required={required}
          accept={acceptString}
          className={style.fileInput}
          onChange={onFileSelectionChange}
          id={`fileInput${id}`}
          ref={fileUploadRef}
          tabIndex={-1}
          disabled={disabled}
          multiple={numFilesLimit > 1}
        />
        <div
          data-testid={testIds.uploadButton}
          className={uploadFileButtonClass}
          onClick={onUploadButtonClick}
          onKeyDown={onUploadButtonKeyDown}
          onFocus={_onFocus}
          onBlur={_onBlur}
          ref={uploadButtonRef}
          tabIndex={0}
          role="button"
          aria-describedby={
            value.length > 1
              ? undefined
              : getFileNameId({ parentCompId: id, fileIndex: 0 })
          }
          aria-haspopup="true"
        >
          <svg
            className={classNames(
              style.plusSvg,
              customCssClasses(semanticClassNames.icon),
            )}
            width="15px"
            height="15px"
            viewBox="0 0 15 15"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <g className={style.plusIcon}>
                <rect x="6" y="1" width="3" height="13" />
                <rect x="1" y="6" width="13" height="3" />
              </g>
            </g>
          </svg>
          <span
            className={classNames(
              style.buttonLabel,
              customCssClasses(semanticClassNames.label),
            )}
            data-testid={testIds.buttonLabel}
          >
            {buttonLabel}
          </span>
        </div>
        {value.length > 1 ? (
          <NumberOfFilesLink
            parentCompId={id}
            files={value}
            placeholderLabel={placeholderLabel}
            shouldShowValidityIndication={shouldShowValidityIndication}
            translations={translations}
            disabled={disabled}
            onFileRemoval={onFileRemoval}
            onXIconKeyDown={onXIconKeyDown}
            uploadStatus={uploadStatus}
            externallyOpenPopper={externallyOpenPopper}
            externallyClosePopper={externallyClosePopper}
            numFilesLimit={numFilesLimit}
            filesFont={filesFont}
            fileType={fileType}
            setTextBellowButtonElem={setTextBellowButton}
            updateLiveRegion={updateLiveRegion}
            scopedClassName={scopedClassName}
          />
        ) : (
          <FilesNameList
            parentCompId={id}
            files={value}
            skin={skin}
            disabled={disabled}
            placeholderLabel={placeholderLabel}
            shouldShowValidityIndication={shouldShowValidityIndication}
            onFileRemoval={onFileRemoval}
            onXIconKeyDown={onXIconKeyDown}
            translations={translations}
            fileType={fileType}
            setTextBellowButtonElem={setTextBellowButton}
            updateLiveRegion={updateLiveRegion}
            disableFileNameXIconFocus={disableFileNameXIconFocus}
            scopedClassName={scopedClassName}
          />
        )}
      </div>
    </div>
  );
};

export default React.forwardRef(FileUploader);
