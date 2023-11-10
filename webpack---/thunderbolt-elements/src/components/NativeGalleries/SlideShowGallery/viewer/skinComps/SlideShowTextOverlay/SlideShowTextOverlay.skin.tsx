import * as React from 'react';
import {
  ISlideShowGalleryImperativeActions,
  ISlideShowGalleryProps,
} from '../../../SlideShowGallery.types';
import SlideShowGallery from '../../SlideShowGallery';
import skinsItemStyle from '../../../../SlideShowGalleryItem/viewer/style/SlideShowTextOverlayItem.scss';
import skinsStyle from './styles/SlideShowTextOverlay.scss';

const SlideShowTextOverlay: React.ForwardRefRenderFunction<
  ISlideShowGalleryImperativeActions,
  Omit<ISlideShowGalleryProps, 'skin'>
> = (props, ref) => (
  <SlideShowGallery
    ref={ref}
    {...props}
    skinsStyle={skinsStyle}
    skinsItemStyle={skinsItemStyle}
    overlay={<div className={skinsStyle.border} />}
  />
);

export default React.forwardRef(SlideShowTextOverlay);
