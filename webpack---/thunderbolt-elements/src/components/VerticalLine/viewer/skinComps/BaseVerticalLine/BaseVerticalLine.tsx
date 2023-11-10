import classNames from 'clsx';
import * as React from 'react';
import {
  customCssClasses,
  getDataAttributes,
  getTabIndexAttribute,
} from '@wix/editor-elements-common-utils';
import { VerticalLineProps } from '../VerticalLine';
import semanticClassNames from '../../../VerticalLine.semanticClassNames';

type BaseButtonSkinProps = VerticalLineProps & {
  skinsStyle: Record<string, string>;
  className?: string;
};

export const BaseVerticalLine: React.FC<BaseButtonSkinProps> = props => {
  const {
    skinsStyle,
    id,
    className,
    customClassNames = [],
    onMouseEnter,
    onMouseLeave,
  } = props;
  return (
    <div
      id={id}
      {...getDataAttributes(props)}
      {...getTabIndexAttribute(props.a11y)}
      className={classNames(skinsStyle.root, className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {skinsStyle.line && (
        <div
          className={classNames(
            skinsStyle.line,
            customCssClasses(semanticClassNames.root, ...customClassNames),
          )}
        />
      )}
    </div>
  );
};
