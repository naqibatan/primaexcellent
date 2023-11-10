import * as React from 'react';
import { VerticalLineProps } from '../VerticalLine';
import { IVerticalLineProps } from '../../../VerticalLine.types';
import VerticalLine from '../../VerticalLine';
import skinsStyle from './styles/ClassicVerticalSolidLine.scss';
import { BaseVerticalLine } from './BaseVerticalLine';

const VerticalSolidLineSkin: React.FC<VerticalLineProps> = props => (
  <BaseVerticalLine {...props} skinsStyle={skinsStyle} />
);

const VerticalSolidLine: React.FC<Omit<IVerticalLineProps, 'skin'>> = props => {
  return <VerticalLine skin={VerticalSolidLineSkin} {...props} />;
};

export default VerticalSolidLine;
