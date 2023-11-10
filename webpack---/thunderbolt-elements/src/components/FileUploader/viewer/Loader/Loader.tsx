import * as React from 'react';
import classNames from 'clsx';
import { ILoaderProps } from '../../FileUploader.types';
import LoaderIcon from './assets/loader.svg';
import style from './style/Loader.scss';

export const Loader: React.FunctionComponent<ILoaderProps> = ({
  uploadStatus,
}) => (
  <LoaderIcon
    className={classNames(style.spinner, {
      [style.isUploading]: uploadStatus === 'Started',
    })}
  />
);
