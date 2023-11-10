import {
  IPlatformData,
  withCompController,
} from '@wix/editor-elements-integrations';
import { getValidationControllerProps } from '@wix/editor-elements-common-utils';
import {
  ITimePickerControllerProps,
  ITimePickerMapperProps,
  ITimePickerProps,
} from '../TimePicker.types';

const getComponentProps = ({
  mapperProps,
  controllerUtils,
}: IPlatformData<
  ITimePickerMapperProps,
  ITimePickerProps,
  never
>): ITimePickerControllerProps => {
  return {
    ...mapperProps,
    ...getValidationControllerProps(controllerUtils.updateProps),
  };
};

export default withCompController(getComponentProps);
