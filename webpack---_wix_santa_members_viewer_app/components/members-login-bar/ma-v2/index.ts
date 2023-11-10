import { CreateControllerFn } from '@wix/yoshi-flow-editor';

import { getContext } from './viewer-controller/context';
import { addLoginHandler } from './handlers';
import {
  getMembersLoginWidgets,
  setMembersLoginWidgets,
} from '../../../services/state';
import { getLoginBarMenu } from './util';

export const controllerMAV2: CreateControllerFn = async (props) => {
  const { contextProps, contextServices } = getContext(props);
  const { environment } = contextProps.flowAPI;
  const { user } = contextProps.wixCodeApi;
  const { stateService, cacheService, menuService } = contextServices;
  const shouldRenderMenu = user.currentUser.loggedIn && !environment.isEditor;

  return {
    async pageReady() {
      if (shouldRenderMenu) {
        await stateService.fetchInitialData();

        menuService.initializeMenuItems({
          ...stateService,
          cacheService,
        });
      }

      addLoginHandler(contextProps, contextServices);

      setMembersLoginWidgets([
        ...getMembersLoginWidgets(),
        ...getLoginBarMenu(contextProps.$w),
      ]);
    },
  };
};
