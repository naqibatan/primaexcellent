import { CreateControllerFn } from '@wix/yoshi-flow-editor';

import { controllerMAV2 } from './ma-v2';
import { controllerCurrentMA } from './current-ma';
import { ControllerConfig, FlowAPI } from '../../types';
import { isProfilePageBoBInstalled } from '../../utils/site';
import { Experiment } from '../../constants';

const getLoginBarController = async (
  flowAPI: FlowAPI,
  controllerConfig: ControllerConfig,
) => {
  const isLoginBarSplitV2Enabled = flowAPI.experiments.enabled(
    Experiment.LoginBarSplitV2,
  );

  if (isLoginBarSplitV2Enabled) {
    const isMembersAreaV2 =
      // @ts-expect-error
      controllerConfig?.connections?.[0]?.config?.isMembersAreaV2;

    return isMembersAreaV2 ||
      (await isProfilePageBoBInstalled(controllerConfig.wixCodeApi))
      ? controllerMAV2
      : controllerCurrentMA;
  }

  return controllerCurrentMA;
};

const createController: CreateControllerFn = async (props) => {
  const loginBarController = await getLoginBarController(
    props.flowAPI,
    props.controllerConfig,
  );

  return loginBarController(props);
};

export default createController;
