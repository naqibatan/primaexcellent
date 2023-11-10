import * as React from 'react';
import classNames from 'clsx';
import { createPortal } from 'react-dom';
import { useDomDirection } from '@wix/editor-elements-common-utils';
import { INumberOfFilesLinkProps } from '../../FileUploader.types';
import {
  NumberOfFilesTranslationPlaceholder,
  NumberOfErrorsTranslationPlaceholder,
  testIds,
  openFilesPopperKeyCodes,
  closeFilesPopperKeyCodes,
  keyCodesToExcludeFromPreventDefault,
} from '../../constants';
import { CustomPopperProps } from '../../../../providers/usePopper/usePopper';
import { FilesPopperContent } from '../FilesPopperContent/FilesPopperContent';
import SuccessIcon from '../assets/successIcon.svg';
import { Loader } from '../Loader/Loader';
import { getFileNameId, getNumberOfFilesLinkId } from '../utils';
import { useExpandableListKeyDown } from '../../../../providers/useExpandableListKeyDown/useExpandableListKeyDown';
import { usePopperWrapper } from '../usePopperWrapper';
import style from './style/NumberOfFilesLink.scss';

const noop = () => {};

const popperConfig: CustomPopperProps = {
  placement: 'bottom-start',
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 8],
      },
    },
    {
      name: 'flip',
      options: {
        boundary: 'clippingParents',
        fallbackPlacements: ['top-start', 'bottom-start'],
        allowedAutoPlacements: ['top-start', 'bottom-start'],
      },
    },
  ],
};

export const NumberOfFilesLink: React.FunctionComponent<
  INumberOfFilesLinkProps
> = ({
  files,
  placeholderLabel,
  translations,
  disabled,
  onFileRemoval,
  onXIconKeyDown,
  shouldShowValidityIndication,
  parentCompId,
  uploadStatus = 'Not_Started',
  externallyOpenPopper,
  externallyClosePopper,
  numFilesLimit,
  filesFont,
  fileType,
  setTextBellowButtonElem,
  updateLiveRegion,
  scopedClassName,
}) => {
  const hasFiles = !!files.length;
  const isPlaceholder = !hasFiles;
  const {
    showPopper,
    hidePopper,
    isOpen,
    popperWrapper,
    popper,
    popperSourceElem,
    setPopperSourceElem,
    setPopperTargetElem,
    popperStyles,
    popperAttributes,
  } = usePopperWrapper({
    scopedClassName,
    popperConfig,
    externallyClosePopper,
    externallyOpenPopper,
    canOpenPopper: !isPlaceholder,
  });
  const isFixedPositionPopper = !!externallyOpenPopper;
  const exceededFilesLimit = files.length > numFilesLimit;
  const placeholder = placeholderLabel || ' ';
  const { direction, directionRef } = useDomDirection<HTMLDivElement>();

  React.useEffect(() => {
    if (uploadStatus === 'Failed') {
      showPopper();
    }
  }, [uploadStatus, showPopper]);

  React.useEffect(() => {
    if (isOpen && popperWrapper && popper) {
      popper.focus({ preventScroll: true });
    }
  }, [isOpen, popperWrapper, popper]);

  React.useEffect(() => {
    setTextBellowButtonElem(popperSourceElem);
  }, [setTextBellowButtonElem, popperSourceElem]);

  const numberOfErrors = files.reduce((acc, currentFile) => {
    return currentFile.valid ? acc : acc + 1;
  }, 0);

  const numberOfFilesLinkClassName = classNames(style.numberOfFilesLink, {
    [style.hasFiles]: hasFiles,
    [style.link]: !exceededFilesLimit,
    [style.placeholder]: isPlaceholder,
    [style.error]: numberOfErrors > 0 || exceededFilesLimit,
    [style.fixedPositionPopper]: !!externallyOpenPopper && isOpen,
  });

  const getNumberOfSelectedFilesText = () => {
    const isSingleFileSelected = files.length === 1;
    return isSingleFileSelected
      ? translations.singleFileSelectedFile
      : translations.numberOfSelectedFiles!.replace(
          NumberOfFilesTranslationPlaceholder,
          `${files.length}`,
        );
  };

  const handleClick: React.MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();
    showPopper();
  };

  const getTextBelowButton = () => {
    if (exceededFilesLimit) {
      return translations.exceededFilesLimit!.replace(
        NumberOfFilesTranslationPlaceholder,
        `${numFilesLimit}`,
      );
    }

    if (numberOfErrors > 0) {
      return getErrorText();
    } else {
      return getNumberOfSelectedFilesText();
    }
  };

  const getErrorText = () => {
    const numOfErrors = numberOfErrors;
    return numOfErrors > 1
      ? translations.multipleErrors!.replace(
          NumberOfErrorsTranslationPlaceholder,
          `${numOfErrors}`,
        )
      : translations.singleError;
  };

  const { hoveredOptionIndex, onKeyDown: onKeyDownOpenClosePopper } =
    useExpandableListKeyDown({
      isListOpen: isOpen,
      openListFn: showPopper,
      closeListFn: hidePopper,
      openListKeyCodes: openFilesPopperKeyCodes,
      closeListKeyCodes: closeFilesPopperKeyCodes,
      keyCodesToExcludeFromPreventDefault,
      initialHoveredOptionIndex: -1,
      listLength: files.length,
      circularMode: true,
      resetOnListClose: true,
      resetOnLengthChange: true,
    });

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    onKeyDownOpenClosePopper(e);

    if (hoveredOptionIndex >= 0) {
      onXIconKeyDown(hoveredOptionIndex, e);
    }
  };

  const shouldDisableLiveRegionUpdatesForPopperContent =
    uploadStatus === 'Done';

  React.useEffect(() => {
    if (uploadStatus === 'Done') {
      updateLiveRegion('All files uploadeded');
    }
  }, [uploadStatus, updateLiveRegion]);

  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRender.current && popperSourceElem) {
      popperSourceElem?.focus();
      isFirstRender.current = false;
    }
  }, [isFirstRender, popperSourceElem]);

  return (
    <div
      id={getNumberOfFilesLinkId(parentCompId)}
      className={numberOfFilesLinkClassName}
      data-testid={testIds.numberOfFilesLink}
      onClick={exceededFilesLimit ? undefined : handleClick}
      ref={setPopperSourceElem}
      tabIndex={0}
      aria-haspopup="true"
      aria-expanded={isOpen}
      role={exceededFilesLimit ? 'alert' : 'button'}
      onKeyDown={handleOnKeyDown}
      aria-activedescendant={
        hoveredOptionIndex >= 0
          ? getFileNameId({ parentCompId, fileIndex: hoveredOptionIndex })
          : undefined
      }
    >
      <div
        data-testid={testIds.textBelowButton}
        className={style.textBelowButton}
      >
        {isPlaceholder ? placeholder : getTextBelowButton()}
      </div>

      <div
        data-testid={testIds.closedPopperStatusIndicator}
        className={classNames(style.statusIndicator, {
          [style.visible]: !isOpen,
        })}
        ref={directionRef}
      >
        <Loader uploadStatus={uploadStatus} />
        <SuccessIcon
          className={classNames(style.successIcon, {
            [style.uploadedSuccessfully]: uploadStatus === 'Done',
          })}
        />
      </div>
      {isOpen &&
        popperWrapper &&
        createPortal(
          <div
            className={classNames(style.popperWrapper, {
              [style.fixedPositionPopper]: isFixedPositionPopper,
            })}
            style={{ direction }}
          >
            <FilesPopperContent
              popperRef={setPopperTargetElem}
              parentCompId={parentCompId}
              popperStyles={popperStyles.popper}
              popperAttributes={popperAttributes.popper}
              closePopper={hidePopper}
              files={files}
              disabled={disabled}
              shouldShowValidityIndication={shouldShowValidityIndication}
              onFileRemoval={onFileRemoval}
              uploadStatus={uploadStatus}
              isFixedPositionPopper={isFixedPositionPopper}
              translations={translations}
              filesFont={filesFont}
              fileType={fileType}
              currentVirtualFocusedItem={
                hoveredOptionIndex >= 0 ? hoveredOptionIndex : undefined
              }
              updateLiveRegion={
                shouldDisableLiveRegionUpdatesForPopperContent
                  ? noop
                  : updateLiveRegion
              }
            />
          </div>,
          popperWrapper,
        )}
    </div>
  );
};
