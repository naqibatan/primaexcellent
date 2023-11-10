import * as React from 'react';
import { testIds } from '../../constants';
import { ICenterEllipsisProps } from '../../FileUploader.types';
import style from './style/CenterEllipsis.scss';

export const CenterEllipsis: React.FC<ICenterEllipsisProps> = ({
  content = '',
}) => {
  const contentStart = content.substring(0, content.length * 0.8);
  const contentEnd = content.substring(content.length * 0.8);
  return (
    <div
      data-testid={testIds.centerEllipsis}
      title={content}
      className={style.content}
    >
      <span
        data-testid={testIds.centerEllipsisStart}
        className={style.ellipsisStart}
      >
        {contentStart}
      </span>
      {contentEnd}
    </div>
  );
};
