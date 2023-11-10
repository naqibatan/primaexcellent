import React, { useEffect, useState } from 'react';
import {
  CustomPopperProps,
  usePopper,
} from '../../../providers/usePopper/usePopper';
import { useClickOutside } from '../../../providers/useClickOutside/useClickOutside';
import { IFileUploaderProps } from '../FileUploader.types';
import {
  createPoppersWrapperInDOM,
  removePoppersWrapperFromDOM,
} from './utils';

type UsePopperWrapper = Pick<
  IFileUploaderProps,
  'externallyOpenPopper' | 'externallyClosePopper'
> & {
  forceShowTooltip?: boolean;
  scopedClassName?: string;
  popperConfig?: CustomPopperProps;
  canOpenPopper?: boolean;
};
export const usePopperWrapper = <
  RefElementType extends HTMLElement = HTMLElement,
  PopperElementType extends HTMLElement = HTMLElement,
>(
  props: UsePopperWrapper,
) => {
  const {
    forceShowTooltip,
    scopedClassName,
    popperConfig,
    externallyClosePopper,
    externallyOpenPopper,
    canOpenPopper = true,
  } = props;
  const [isOpen, setOpen] = useState(false);
  const [popperWrapper, setPopperWrapper] = useState<HTMLElement>();

  const {
    ref: popperSourceElem,
    setRef: setPopperSourceElem,
    popper,
    setPopper: setPopperTargetElem,
    styles: popperStyles,
    attributes: popperAttributes,
  } = usePopper<RefElementType, PopperElementType>(popperConfig);

  useEffect(() => {
    if (forceShowTooltip || isOpen) {
      const wrapper = createPoppersWrapperInDOM();
      setPopperWrapper(wrapper);
    }
  }, [forceShowTooltip, isOpen, setPopperWrapper]);

  useEffect(() => {
    if (popperWrapper && scopedClassName) {
      popperWrapper.classList.add(scopedClassName);
    }
  }, [popperWrapper, scopedClassName]);

  useEffect(() => {
    return () => removePoppersWrapperFromDOM(popperWrapper);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hidePopper = (e?: React.MouseEvent<HTMLElement>) => {
    e?.stopPropagation();
    setOpen(false);
    removePoppersWrapperFromDOM(popperWrapper);
    externallyClosePopper?.();
  };
  const showPopper = (e?: React.MouseEvent<HTMLElement>) => {
    if (canOpenPopper) {
      e?.stopPropagation();
      setOpen(true);
      externallyOpenPopper?.();
    }
  };

  useClickOutside([popperSourceElem], hidePopper);

  return {
    popperWrapper,
    hidePopper,
    showPopper,
    isOpen,
    popper,
    popperSourceElem,
    setPopperSourceElem,
    setPopperTargetElem,
    popperStyles,
    popperAttributes,
  };
};
