import classNames from 'clsx';
import React, { FC } from 'react';
import { createPortal } from 'react-dom';
import { testIds } from '../../constants';
import { IFileErrorIconProps } from '../../FileUploader.types';
import { getFileNameErrorTooltipId } from '../utils';
import { usePopperWrapper } from '../usePopperWrapper';
import { CustomPopperProps } from '../../../../providers/usePopper/usePopper';
import PopperErrorIcon from './assets/popperErrorIcon.svg';
import TooltipArrow from './assets/tooltipArrow.svg';
import style from './style/FileErrorIcon.scss';

const popperConfig: CustomPopperProps = {
  placement: 'top',
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 8],
      },
    },
    {
      name: 'arrow',
      options: {
        padding: 3,
      },
    },
  ],
};
export const FileErrorIcon: FC<IFileErrorIconProps> = ({
  fileNameId,
  message,
  withSingleFileBehavior,
  forceShowTooltip = false,
  scopedClassName,
  direction,
}) => {
  const {
    showPopper,
    hidePopper,
    isOpen,
    popperWrapper,
    setPopperTargetElem,
    popperStyles,
    popperAttributes,
    setPopperSourceElem,
  } = usePopperWrapper({ scopedClassName, forceShowTooltip, popperConfig });

  const tooltipId = getFileNameErrorTooltipId(fileNameId);

  const shouldShowTooltip = forceShowTooltip || isOpen;

  return (
    <div
      className={classNames(style.tooltipContainer, {
        [style.singleFileBehavior]: withSingleFileBehavior,
      })}
      data-testid={testIds.tooltipContainer}
    >
      <div
        className={style.tooltipTrigger}
        data-testid={testIds.tooltipTrigger}
        role="button"
        aria-expanded={shouldShowTooltip}
        aria-describedby={tooltipId}
        ref={setPopperSourceElem}
        onMouseOver={showPopper}
        onMouseOut={hidePopper}
      >
        <PopperErrorIcon role="presentation" />
      </div>
      {shouldShowTooltip &&
        popperWrapper &&
        createPortal(
          <div
            ref={setPopperTargetElem}
            style={popperStyles.popper}
            {...popperAttributes.popper}
            id={tooltipId}
            className={style.tooltip}
            data-testid={testIds.errorTooltip}
            role="tooltip"
            aria-live="polite"
            aria-label={message}
            aria-hidden="true"
          >
            <div data-testid={testIds.errorTooltipText} style={{ direction }}>
              {message}
            </div>
            <div
              data-popper-arrow
              style={popperStyles.arrow}
              {...popperAttributes.arrow}
              className={style.arrowWrapper}
            >
              <TooltipArrow
                className={style.tooltipArrow}
                role="presentation"
              />
            </div>
          </div>,
          popperWrapper,
        )}
    </div>
  );
};
