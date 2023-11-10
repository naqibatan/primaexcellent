import { ViewerScriptFlowAPI } from '@wix/yoshi-flow-editor';

import { AppData, ControllerConfig, WixCodeApi } from '../types';
import { fetchMenusData } from '../current-ma';
import { WarmupDataService } from './warmup-data';

export const initAppDataStore = (
  appParams: ControllerConfig['appParams'],
  wixCodeApi: WixCodeApi,
  flowApi: ViewerScriptFlowAPI,
) => {
  const warmupDataService = new WarmupDataService(wixCodeApi.window.warmupData);
  let appDataPromise: null | Promise<AppData> = null;
  return {
    getAppData: () => {
      if (!appDataPromise) {
        appDataPromise = fetchMenusData({
          appParams,
          wixCodeApi,
          flowApi,
          warmupDataService,
        });
      }
      return appDataPromise;
    },
  };
};
