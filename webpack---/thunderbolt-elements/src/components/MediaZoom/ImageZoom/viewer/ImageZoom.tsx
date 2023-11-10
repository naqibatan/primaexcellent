import * as React from 'react';
import { getDataAttributes } from '@wix/editor-elements-common-utils';
import { IImageZoomGalleryProps, ImageZoomImages } from '../ImageZoom.types';
import MediaZoomBase from './MediaZoomBase';
import { getSelectedImageIndex } from './utils';

const ImageZoom: React.FC<IImageZoomGalleryProps> = props => {
  const {
    id,
    className,
    uri,
    alt,
    name,
    width,
    height,
    displayMode,
    onClose,
    link,
    title,
    images,
    dataItemId: initialDataItemId = '',
    onImageChange,
  } = props;

  const imageProps = {
    id,
    containerId: id,
    uri,
    alt,
    name,
    width,
    height,
    displayMode,
    link,
    title,
  };

  const [dataItemId, setDataItemId] = React.useState(initialDataItemId);
  const imagesList = images ?? ([imageProps] as ImageZoomImages);
  const onImageChangeCallback = (newDataItemId: string) => {
    setDataItemId(newDataItemId);
    // TODO - make onImageChange required after TB side is merged
    onImageChange?.(newDataItemId);
  };

  return (
    <MediaZoomBase
      id={id}
      {...getDataAttributes(props)}
      className={className}
      images={imagesList}
      selectedImageIndex={getSelectedImageIndex(imagesList, dataItemId)}
      onImageChangeCallback={onImageChangeCallback}
      onClose={onClose}
    />
  );
};

export default ImageZoom;
