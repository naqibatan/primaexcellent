import { withCompController } from '@wix/editor-elements-integrations';
import {
  IFileUploaderControllerProps,
  IFileUploaderMapperProps,
  IFileUploaderProps,
  IFileUploaderStateValues,
} from '../FileUploader.types';

export default withCompController<
  IFileUploaderMapperProps,
  IFileUploaderControllerProps,
  IFileUploaderProps,
  IFileUploaderStateValues
>(({ controllerUtils, mapperProps, stateValues }) => {
  const { compId, isMobileView, ...restMapperProps } = mapperProps;
  const { updateProps } = controllerUtils;
  const {
    setSiteScrollingBlocked,
    enableCyclicTabbing,
    disableCyclicTabbing,
    scopedClassName,
  } = stateValues;

  let externalHandlers = {};

  if (isMobileView) {
    externalHandlers = {
      externallyOpenPopper: () => {
        enableCyclicTabbing(compId);
        setSiteScrollingBlocked(true, compId);
      },
      externallyClosePopper: () => {
        setSiteScrollingBlocked(false, compId);
        disableCyclicTabbing(compId);
      },
    };
  }

  return {
    ...restMapperProps,
    ...externalHandlers,
    scopedClassName,
    onSelectedFilesChange: selectedFiles => {
      updateProps({
        value: selectedFiles,
        uploadStatus: 'Not_Started',
        shouldShowValidityIndication: true,
      });
    },
    resetFileUploader: () => {
      updateProps({
        shouldShowValidityIndication: false,
        value: [],
        uploadStatus: 'Not_Started',
        isInvalidToUpload: false,
      });
    },
  };
});
