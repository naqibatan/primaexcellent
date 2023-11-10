import { CreateControllerFn, IUser } from '@wix/yoshi-flow-editor';

import { AppData, GlobalControllerConfig } from '../../../types';
import {
  APP_WIDGET_LOGIN_MENU_ID,
  APP_WIDGET_MEMBERS_MENU_ID,
  LOGIN_MENU_ID,
  MEMBERS_MENU_ID,
} from '../../../constants';
import {
  renderMenus,
  setConfigGlobally,
  setCurrentUserGlobally,
  setGlobalController,
} from '../../../current-ma';
import { toMonitored } from '../../../utils/monitoring';
import { setMobileMembersMenuValue } from '../../../current-ma/services/menu-renderer-editor';

export const controllerCurrentMA: CreateControllerFn = async ({
  controllerConfig,
  appData: controllerAppData,
  flowAPI,
}) => {
  const {
    wixCodeApi,
    essentials: { httpClient },
    $w,
  } = controllerConfig;

  const config = controllerConfig as GlobalControllerConfig;
  const hasLoginMenus = !!$w(LOGIN_MENU_ID).length;
  const hasAppWidgetsLoginMenus = !!$w!(APP_WIDGET_LOGIN_MENU_ID).length;
  const hasMemberMenus = !!$w(MEMBERS_MENU_ID).length;
  const hasAppWidgetsMenus = !!$w(APP_WIDGET_MEMBERS_MENU_ID).length;
  const hasMenus =
    hasLoginMenus ||
    hasAppWidgetsLoginMenus ||
    hasMemberMenus ||
    hasAppWidgetsMenus;

  setGlobalController(config);

  if (!hasMenus) {
    return {
      async pageReady() {
        // Needed for public API to work
        await controllerAppData?.initApplication();
      },
    };
  }

  const isInEditor = wixCodeApi.window.viewMode === 'Editor';

  setConfigGlobally(config);

  return {
    async pageReady() {
      const appData = await controllerAppData?.initApplication();

      wixCodeApi.user.onLogin((loggedInUser: IUser) =>
        toMonitored('onLogin', () =>
          setCurrentUserGlobally(loggedInUser, httpClient).then(() =>
            renderMenus(config, appData as AppData, flowAPI),
          ),
        )(),
      );

      if (isInEditor) {
        if (flowAPI.environment.isMobile) {
          setMobileMembersMenuValue(
            $w,
            wixCodeApi,
            (appData as AppData).parsedRouters,
          );
        }
      } else {
        renderMenus(config, appData as AppData, flowAPI);
      }
    },
  };
};
