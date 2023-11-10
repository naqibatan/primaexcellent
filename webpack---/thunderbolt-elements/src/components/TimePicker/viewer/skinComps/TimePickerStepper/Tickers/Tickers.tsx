import * as React from 'react';
import { customCssClasses } from '@wix/editor-elements-common-utils';
import FormFieldSpinnerDown from '../../../assets/FormFieldSpinnerDown.svg';
import FormFieldSpinnerUp from '../../../assets/FormFieldSpinnerUp.svg';
import { ITimePickerTickersProps } from '../../../../TimePicker.types';
import { TEST_IDS } from '../../../../constants';
import semanticClassNames from '../../../../TimePicker.semanticClassNames';
import { classes, st } from './styles/Tickers.st.css';

const Tickers: React.FunctionComponent<ITimePickerTickersProps> = props => {
  const { onIncrement, onDecrement, isDisabled } = props;

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    onIncrement(e);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    onDecrement(e);
  };

  return (
    <div className={classes.root}>
      <button
        tabIndex={-1}
        type="button"
        onMouseDown={handleIncrement}
        className={st(
          classes.ticker,
          customCssClasses(semanticClassNames.icon),
        )}
        disabled={isDisabled}
        data-testid={TEST_IDS.tickerButtonUp}
      >
        <FormFieldSpinnerUp />
      </button>
      <button
        tabIndex={-1}
        type="button"
        onMouseDown={handleDecrement}
        className={st(
          classes.ticker,
          customCssClasses(semanticClassNames.icon),
        )}
        disabled={isDisabled}
        data-testid={TEST_IDS.tickerButtonDown}
      >
        <FormFieldSpinnerDown />
      </button>
    </div>
  );
};

export default Tickers;
