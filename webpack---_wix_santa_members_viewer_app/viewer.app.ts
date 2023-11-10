import { InitAppForPageFn } from '@wix/yoshi-flow-editor';

import { initializeMonitoring, toMonitored } from './utils/monitoring';
import { initAppDataStore } from './services/app-data-store';
import {
  createPublicAPI as currentMACreatePublicAPI,
  initApplication,
} from './current-ma';
import {
  createPublicAPI as maV2CreatePublicAPI,
  getGlobalControllerConfig,
} from './ma-v2';
import { Experiment } from './constants';
import { isProfilePageBoBInstalled } from './utils/site';
import { globalAppState } from './services/global-app-state';

const getIsMembersAreaV2 = () => {
  const flowAPI = globalAppState.getFlowAPI();
  const wixCodeApi = globalAppState.getWixCodeAPI();

  const shouldCheckIsMaV2ByInstalledSection = flowAPI?.experiments.enabled(
    Experiment.CheckIsMaV2ByInstalledSection,
  );

  if (shouldCheckIsMaV2ByInstalledSection) {
    return isProfilePageBoBInstalled(wixCodeApi);
  }

  const controllerConfig = getGlobalControllerConfig();
  return controllerConfig?.config.isMembersAreaV2;
};

const getViewerPlatformExports = async () => {
  const isMembersAreaV2 = !!(await getIsMembersAreaV2());

  return isMembersAreaV2 ? maV2CreatePublicAPI() : currentMACreatePublicAPI();
};

export const initAppForPage: InitAppForPageFn = async (
  initParams,
  platformApis,
  wixCodeApi,
  platformServices,
  flowApi,
) => {
  initializeMonitoring(initParams, platformServices);
  globalAppState.setFlowAPI(flowApi);
  globalAppState.setWixCodeAPI(wixCodeApi);

  const { httpClient } = flowApi;
  const appDataStore = initAppDataStore(initParams, wixCodeApi, flowApi);
  const initApplicationPromise = toMonitored('initAppForPage', () =>
    initApplication(
      initParams as any,
      platformApis as any,
      wixCodeApi,
      httpClient,
      flowApi,
      platformServices,
    ),
  )();

  return {
    initApplication: async () => {
      await initApplicationPromise;
      return appDataStore.getAppData();
    },
  };
};

export const exports = () => {
  return getViewerPlatformExports();
};
