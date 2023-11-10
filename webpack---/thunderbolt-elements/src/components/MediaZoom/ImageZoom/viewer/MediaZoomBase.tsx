import * as React from 'react';
import classNames from 'clsx';
import {
  activateByEscapeButton,
  keyCodes,
  getDataAttributes,
  throttle,
  getFilterEffectStyle,
} from '@wix/editor-elements-common-utils';
import Image from '../../../Image/viewer/Image';
import { MediaZoomProps } from '../ImageZoom.types';
import Link from '../../../Link/viewer/Link';
import { TestIds } from '../constants';
import { useDidMount } from '../../../../providers/useDidMount';
import { DESKTOP_VIEW_DEFAULTS, getDimensions } from './utils';
import styles from './styles/MediaZoom.scss';

const MediaZoomBase: React.FC<MediaZoomProps> = props => {
  const {
    id,
    className,
    onClose,
    images,
    selectedImageIndex,
    onImageChangeCallback,
  } = props;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageInfoBoxRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState(DESKTOP_VIEW_DEFAULTS);
  const [isImageReady, setIsImageReady] = React.useState(true);
  const selectedImageId = `img_${id}_${selectedImageIndex}`;

  const getNextItem = () =>
    selectedImageIndex + 1 < images.length ? selectedImageIndex + 1 : 0;
  const getPrevItem = () =>
    selectedImageIndex ? selectedImageIndex - 1 : images.length - 1;
  const onNextClickHandler: React.MouseEventHandler = event => {
    onItemChangeHandler(getNextItem(), event);
  };
  const onPrevClickHandler: React.MouseEventHandler = event => {
    onItemChangeHandler(getPrevItem(), event);
  };
  const onItemChangeHandler = (
    newSelectedImageIndex: number,
    event?: React.MouseEvent,
  ) => {
    setIsImageReady(false);

    setTimeout(() => {
      const newDataItemId = images[newSelectedImageIndex].id;
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      onImageChangeCallback(newDataItemId);
    }, 250);
  };

  const { link, title, description, width, height } =
    images[selectedImageIndex];

  const onCloseHandler = () => {
    onClose(false);
  };

  React.useEffect(() => {
    const previousFocusedElement = document.activeElement as HTMLElement;
    if (containerRef.current) {
      containerRef.current.focus();
    }
    return () => previousFocusedElement && previousFocusedElement.focus();
  }, []);

  useDidMount(() => {
    const throttledFunc = throttle(setImageSizes, 300);

    throttledFunc();
    window?.addEventListener('resize', throttledFunc);

    return () => {
      window?.removeEventListener('resize', throttledFunc);
    };
  });

  const disableOnClose: React.MouseEventHandler = event => {
    if (!(event.target instanceof HTMLAnchorElement)) {
      event.stopPropagation();
    }
  };

  const setImageSizes = () => {
    const popUp = containerRef.current?.getBoundingClientRect();
    const imageInfo = imageInfoBoxRef.current?.getBoundingClientRect();

    if (popUp) {
      const data = {
        imageMeasures: { width, height },
        screenMeasures: { width: popUp.width, height: popUp.height },
        panelHeight: imageInfo?.height || 0,
      };

      setDimensions(getDimensions(data));
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = event => {
    switch (event.keyCode) {
      case keyCodes.arrowRight:
        onItemChangeHandler(getNextItem());
        break;
      case keyCodes.arrowLeft:
        onItemChangeHandler(getPrevItem());
        break;
      case keyCodes.escape:
        onCloseHandler();
        break;
      default:
        break;
    }
  };

  const containerHandlers =
    images.length > 1 ? { onKeyDown } : { onClick: onCloseHandler };

  const linkOnClickHandler =
    images.length > 1 && !images[selectedImageIndex]?.link?.linkPopupId
      ? onCloseHandler
      : undefined;

  const renderImageInfo = () => (
    <div
      className={classNames(styles.info, {
        [styles.hidden]: !isImageReady,
      })}
      onClick={disableOnClose}
      ref={imageInfoBoxRef}
    >
      {title && (
        <h3 itemProp="name" className={styles.title}>
          {title}
        </h3>
      )}
      {description && (
        <p itemProp="description" className={styles.description}>
          {description}
        </p>
      )}
      {link && (
        <Link
          {...link}
          dataTestId={TestIds.link}
          className={styles.link}
          onClick={linkOnClickHandler}
        >
          Go to link
        </Link>
      )}
    </div>
  );

  const filterEffectSvgUrl = images[selectedImageIndex].filterEffectSvgUrl;

  const filterEffectStyle = getFilterEffectStyle(
    selectedImageId,
    filterEffectSvgUrl,
  ) as React.CSSProperties;

  return (
    <div className={classNames(className, styles.root)} {...containerHandlers}>
      <div
        id={id}
        {...getDataAttributes(props)}
        className={styles.blockingLayer}
        tabIndex={0}
        ref={containerRef}
        onKeyDown={activateByEscapeButton}
        data-testselectedimageindex={selectedImageIndex}
      >
        <div
          className={classNames(styles.dialogBox, {
            [styles.hidden]: !isImageReady,
          })}
          style={
            {
              maxWidth: dimensions.dialogBoxWidth,
              maxHeight: dimensions.dialogBoxHeight,
              marginTop: dimensions.marginTop,
              '--width': `${dimensions.imageContainerWidth}px`,
              '--height': `${dimensions.imageContainerHeight}px`,
              ...filterEffectStyle,
            } as React.CSSProperties
          }
        >
          <Image
            {...images[selectedImageIndex]}
            onLoad={() => {
              setIsImageReady(true);
              setImageSizes();
            }}
            className={styles.imageContainer}
            id={`img_${id}_${selectedImageIndex}`}
            displayMode="fit"
          />
          {renderImageInfo()}
        </div>
        <div
          className={styles.xButton}
          onKeyDown={activateByEscapeButton}
          data-testid={TestIds.close}
          onClick={images.length > 1 ? onCloseHandler : undefined}
        >
          <svg
            viewBox="0 0 180 180"
            className={styles.svgButtonClose}
            tabIndex={0}
            role="button"
            aria-label="close"
          >
            <path d="M5 5 L175 175 M175 5 L5 175" />
          </svg>
        </div>
        {images.length > 1 && (
          <>
            <div
              className={styles.nextButton}
              onClick={onNextClickHandler}
              data-testid={TestIds.next}
            >
              <svg
                viewBox="0 0 180 310"
                className={styles.svgNavButton}
                tabIndex={0}
                role="button"
                aria-label="next"
              >
                <path d="M10 10 L170 161 M170 150 L10 300" />
              </svg>
            </div>
            <div
              className={styles.prevButton}
              onClick={onPrevClickHandler}
              data-testid={TestIds.prev}
            >
              <svg
                viewBox="0 0 180 310"
                className={styles.svgNavButton}
                tabIndex={0}
                role="button"
                aria-label="previous"
              >
                <path d="M170 10 L10 161 M10 150 L170 300" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaZoomBase;
