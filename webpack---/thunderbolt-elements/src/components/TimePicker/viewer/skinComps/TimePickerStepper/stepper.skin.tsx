import * as React from 'react';
import {
  ITimePickerProps,
  ITimePickerImperativeActions,
} from '../../../TimePicker.types';
import TimePickerBase from '../../TimePickerBase';
import TimePickerStepperBase from './TimePickerStepperBase';

const TimePickerStepper: React.ForwardRefRenderFunction<
  ITimePickerImperativeActions,
  ITimePickerProps
> = (props, ref) => {
  return (
    <TimePickerBase
      {...props}
      ControllerComponent={TimePickerStepperBase}
      ref={ref}
    ></TimePickerBase>
  );
};

export default React.forwardRef(TimePickerStepper);
