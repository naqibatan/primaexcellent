import { ControllerParams } from '@wix/yoshi-flow-editor';

import { ContextProps, ContextServices } from '../../../../types';
import { CurrentUserService } from '../services/current-user';
import { RolesService } from '../services/roles';
import { CacheService } from '../services/memory-cache';
import { MenuService } from '../services/menu';
import { StateService } from '../services/state';
import { WarmupDataService } from '../../../../services/warmup-data';
import { RoutesConfigurationService } from '../../../../services/routes-configuration';
import { PageService } from '../services/page';

type GetContextReturnType = {
  contextProps: ContextProps;
  contextServices: ContextServices;
};

export const getContext = ({
  flowAPI,
  controllerConfig: { wixCodeApi, $w, platformAPIs, appParams },
}: ControllerParams): GetContextReturnType => {
  const currentUserService = new CurrentUserService(flowAPI.httpClient);
  const rolesService = new RolesService(flowAPI.httpClient);
  const cacheService = new CacheService(
    platformAPIs.storage.memory,
    wixCodeApi.site,
    appParams.appDefinitionId,
  );
  const menuService = new MenuService($w);
  const warmupDataService = new WarmupDataService(wixCodeApi.window.warmupData);
  const routesService = new RoutesConfigurationService(flowAPI.httpClient);
  const pageService = new PageService(wixCodeApi.site);
  const stateService = new StateService(
    { wixCodeApi, isSSR: flowAPI.environment.isSSR },
    {
      currentUserService,
      cacheService,
      rolesService,
      warmupDataService,
      routesService,
      pageService,
    },
  );

  const contextServices = {
    currentUserService,
    cacheService,
    rolesService,
    menuService,
    stateService,
  };

  return {
    contextProps: { $w, flowAPI, wixCodeApi, appParams },
    contextServices,
  };
};
