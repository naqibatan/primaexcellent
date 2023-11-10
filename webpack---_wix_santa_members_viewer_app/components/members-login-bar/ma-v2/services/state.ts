import { makeAutoObservable } from 'mobx';
import { Member } from '@wix/ambassador-members-v1-member/types';

import {
  CacheService,
  CurrentUserService,
  Nullable,
  PageService,
  RolesService,
  RouteConfiguration,
  RoutesConfigurationService,
  StateService as IStateService,
  WarmupDataService,
  WixCodeApi,
} from '../../../../types';
import { INITIAL_WARMUP_DATA } from '../../../../constants';
import { getGlobalControllerConfig } from '../../../../ma-v2';

type WarmupData = Pick<
  IStateService,
  'currentUser' | 'currentUserRoles' | 'routes' | 'membersAreaPagePrefix'
>;

type ContextProps = { wixCodeApi: WixCodeApi; isSSR: boolean };

type ContextServices = {
  cacheService: CacheService;
  currentUserService: CurrentUserService;
  rolesService: RolesService;
  warmupDataService: WarmupDataService;
  routesService: RoutesConfigurationService;
  pageService: PageService;
};

export class StateService implements IStateService {
  routes: RouteConfiguration[] = [];
  currentUser: Nullable<Member> = null;
  currentUserRoles: string[] = [];
  membersAreaPagePrefix = '';

  constructor(
    private readonly contextProps: ContextProps,
    private readonly contextServices: ContextServices,
  ) {
    makeAutoObservable(this);
  }

  async fetchCurrentUser() {
    const { cacheService, currentUserService } = this.contextServices;
    if (cacheService.hasCurrentUser()) {
      this.currentUser = cacheService.getCurrentUser();
      return;
    }

    this.currentUser = await currentUserService.getCurrentUser();
    cacheService.setCurrentUser(this.currentUser!);
  }

  async fetchCurrentUserRoles() {
    const { cacheService, rolesService } = this.contextServices;
    if (cacheService.hasRoles()) {
      this.currentUserRoles = cacheService.getRoles();
      return;
    }

    this.currentUserRoles = await rolesService.getMemberRoles(
      this.currentUser?.id ?? null,
    );
    cacheService.setRoles(this.currentUserRoles!);
  }

  async fetchRouteConfigurations() {
    const { cacheService, routesService } = this.contextServices;
    if (cacheService.hasRoutes()) {
      this.routes = cacheService.getRoutes();
      return;
    }

    const routesFromGlobalController =
      getGlobalControllerConfig()?.config?.routes;

    this.routes =
      routesFromGlobalController ??
      (await routesService.fetchRouteConfigurations());

    cacheService.setRoutes(this.routes);
  }

  async fetchMembersAreaPagePrefix() {
    const { pageService } = this.contextServices;

    const membersAreaPagePrefix = await pageService.getMembersAreaPagePrefix();
    this.membersAreaPagePrefix = membersAreaPagePrefix.replace('/', '');
  }

  async fetchInitialData() {
    const { isSSR } = this.contextProps;

    if (isSSR) {
      await this.fetchDataWrapper();
      const { currentUser, currentUserRoles, routes, membersAreaPagePrefix } =
        this;
      return this.contextServices.warmupDataService.setData(
        INITIAL_WARMUP_DATA,
        { currentUser, currentUserRoles, routes, membersAreaPagePrefix },
      );
    }

    const warmupData =
      this.contextServices.warmupDataService.getData<WarmupData>(
        INITIAL_WARMUP_DATA,
      );

    if (warmupData) {
      this.currentUser = warmupData.currentUser;
      this.currentUserRoles = warmupData.currentUserRoles;
      this.routes = warmupData.routes;
      this.membersAreaPagePrefix = warmupData.membersAreaPagePrefix;
      return;
    }

    return this.fetchDataWrapper();
  }

  private async fetchDataWrapper() {
    await this.fetchCurrentUser();
    await Promise.all([
      this.fetchRouteConfigurations(),
      this.fetchCurrentUserRoles(),
      this.fetchMembersAreaPagePrefix(),
    ]);
  }
}
