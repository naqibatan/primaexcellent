import type { IWixAPI, ViewerScriptFlowAPI } from '@wix/yoshi-flow-editor';

interface GlobalAppState {
  getFlowAPI: () => ViewerScriptFlowAPI | null;
  setFlowAPI: (flowAPI: ViewerScriptFlowAPI) => void;
  getWixCodeAPI: () => IWixAPI | null;
  setWixCodeAPI: (wixCodeAPI: IWixAPI) => void;
}

const initGlobalAppState = (): GlobalAppState => {
  let _flowAPI: ViewerScriptFlowAPI | null = null;
  let _wixCodeApi: IWixAPI | null = null;

  return {
    getFlowAPI: () => _flowAPI,
    setFlowAPI: (flowAPI) => (_flowAPI = flowAPI),
    getWixCodeAPI: () => _wixCodeApi,
    setWixCodeAPI: (wixCodeAPI) => (_wixCodeApi = wixCodeAPI),
  };
};

export const globalAppState = initGlobalAppState();
