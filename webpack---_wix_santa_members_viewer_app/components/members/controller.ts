import { CreateControllerFn } from '@wix/yoshi-flow-editor';

import { FlowAPI, IControllerConfig } from '../../types';
import { controllerCurrentMA } from './current-ma';
import { controllerMAV2 } from './ma-v2';
import { isProfilePageBoBInstalled } from '../../utils/site';
import { Experiment } from '../../constants';

const getIsMembersAreaV2 = (flowAPI: FlowAPI) => {
  const shouldCheckIsMaV2ByInstalledSection = flowAPI?.experiments.enabled(
    Experiment.CheckIsMaV2ByInstalledSection,
  );

  if (shouldCheckIsMaV2ByInstalledSection) {
    return isProfilePageBoBInstalled(flowAPI.controllerConfig.wixCodeApi);
  }

  const config = flowAPI.controllerConfig.config as IControllerConfig;

  return !!config.isMembersAreaV2;
};

const getGlobalController = async (flowAPI: FlowAPI) => {
  const isMembersAreaV2 = await getIsMembersAreaV2(flowAPI);
  return isMembersAreaV2 ? controllerMAV2 : controllerCurrentMA;
};

const createController: CreateControllerFn = async (props) => {
  const globalController = await getGlobalController(props.flowAPI);

  return globalController(props);
};

export default createController;
