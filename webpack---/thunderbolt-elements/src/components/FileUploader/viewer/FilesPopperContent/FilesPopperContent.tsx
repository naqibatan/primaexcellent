import * as React from 'react';
import classNames from 'clsx';
import { IFilesPopperContentProps } from '../../FileUploader.types';
import { testIds } from '../../constants';
import { FileName } from '../FileName/FileName';
import { getFileNameId, getNumberOfFilesLinkId } from '../utils';
import style from './style/FilesPopperContent.scss';

export const FilesPopperContent: React.FunctionComponent<
  IFilesPopperContentProps
> = ({
  files,
  disabled,
  shouldShowValidityIndication,
  onFileRemoval,
  parentCompId,
  popperStyles,
  popperAttributes,
  popperRef,
  isFixedPositionPopper,
  filesFont,
  fileType,
  closePopper,
  translations,
  currentVirtualFocusedItem,
  updateLiveRegion,
}) => {
  const fontOverride = filesFont
    ? ({ '--close_button_fnt': filesFont } as React.CSSProperties)
    : {};

  const handleFileRemoval = (index: number) => {
    if (files.length === 1) {
      closePopper();
    }

    onFileRemoval(index);
  };

  const getPopperStyleOverrides = () => {
    let styles = {};

    if (isFixedPositionPopper) {
      styles = {
        inset: 'auto auto 0',
        bottom: 0,
        top: 'auto',
        transform: 'unset',
        position: 'fixed',
      };
    }

    return styles;
  };

  return (
    <div
      id="popper-content"
      ref={popperRef}
      data-testid={testIds.filesPopper}
      {...popperAttributes}
      className={classNames(style.popper, {
        [style.fixedPositionPopper]: isFixedPositionPopper,
      })}
      style={{
        ...popperStyles,
        ...getPopperStyleOverrides(),
      }}
      role="menu"
      aria-labelledby={getNumberOfFilesLinkId(parentCompId)}
    >
      <div
        role="none"
        className={classNames(style.files, {
          [style.fixedPositionPopper]: isFixedPositionPopper,
        })}
        data-testid={testIds.popperFilesWrapper}
      >
        {files.map((file, index) => (
          <FileName
            fileNameId={getFileNameId({ parentCompId, fileIndex: index })}
            key={`${index}-${file.name}`}
            file={file}
            disabled={disabled}
            shouldShowValidityIndication={shouldShowValidityIndication}
            onFileRemoval={() => handleFileRemoval(index)}
            withCenterEllipsis
            uploadStatus={file.uploadStatus}
            withPopperBehaviour
            isFixedPositionPopper={isFixedPositionPopper}
            filesFont={filesFont}
            translations={translations}
            fileType={fileType}
            virtualFocused={currentVirtualFocusedItem === index}
            updateLiveRegion={updateLiveRegion}
          />
        ))}
      </div>
      {isFixedPositionPopper && (
        <>
          <div
            data-testid={testIds.mobileSeperator}
            className={style.seperator}
          />
          <div
            data-testid={testIds.mobileCloseButton}
            style={fontOverride}
            className={style.closeButton}
            onClick={e => closePopper(e)}
          >
            {translations.mobileClosePopper}
          </div>
        </>
      )}
    </div>
  );
};
