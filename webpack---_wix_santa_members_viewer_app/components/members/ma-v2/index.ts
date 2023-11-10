import { CreateControllerFn } from '@wix/yoshi-flow-editor';

import { setGlobalControllerConfig } from '../../../ma-v2';
import { GlobalControllerConfig } from '../../../types';

export const controllerMAV2: CreateControllerFn = async ({
  controllerConfig,
}) => {
  const _controllerConfig = controllerConfig as GlobalControllerConfig;
  setGlobalControllerConfig(_controllerConfig);

  return {
    async pageReady() {
      // We could return controllerConfig here and take it in exports
      // Need to speak with viewer about this, because it's not typed and not documented...
    },
  };
};
