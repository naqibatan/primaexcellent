import * as React from 'react';
import { IVerticalLineProps } from '../VerticalLine.types';

const VerticalLine: React.FC<IVerticalLineProps> = props => {
  const { skin: ComponentClass, ...skinProps } = props;

  return <ComponentClass {...skinProps} />;
};

export default VerticalLine;
