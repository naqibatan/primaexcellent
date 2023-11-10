import { toMonitored } from '../utils/monitoring';
import {
  GlobalControllerConfig,
  ProfilePageBobPublicAPI,
  ViewerPublicAPI,
} from '../types';
import { PublicAPI } from './public-api';
import { PROFILE_PAGE_BOB_APP_DEF_ID, PublicApiError } from '../constants';
import { RoutesConfigurationService } from '../services/routes-configuration';
import { globalAppState } from '../services/global-app-state';

let _controllerConfig: GlobalControllerConfig | null = null;

export const setGlobalControllerConfig = (
  controllerConfig: GlobalControllerConfig,
) => {
  _controllerConfig = controllerConfig;
};

export const getGlobalControllerConfig = () => {
  return _controllerConfig;
};

const getProfilePageBobPublicAPI = (): Promise<ProfilePageBobPublicAPI> => {
  if (!_controllerConfig) {
    throw new Error(PublicApiError.ControllerConfigNotInitialized);
  }

  return _controllerConfig.wixCodeApi.site.getPublicAPI(
    PROFILE_PAGE_BOB_APP_DEF_ID,
  );
};

const getPublicAPI = () => {
  if (!_controllerConfig) {
    throw new Error(PublicApiError.ControllerConfigNotInitialized);
  }
  const routeService = new RoutesConfigurationService(
    globalAppState.getFlowAPI()!.httpClient,
  );
  return new PublicAPI(_controllerConfig, routeService);
};

export const createPublicAPI = (): ViewerPublicAPI => {
  return {
    hasSocialPages: (onSuccess, onError) =>
      toMonitored('publicApi.hasSocialPages', () =>
        getPublicAPI().hasSocialPages(onSuccess, onError),
      )(),
    getViewedUser: (onSuccess, onError) =>
      toMonitored('publicApi.getViewedUser', async () => {
        const profilePageBobPublicAPI = await getProfilePageBobPublicAPI();
        return profilePageBobPublicAPI.getViewedUser(onSuccess, onError);
      })(),
    navigateToSection: (sectionData, onError) =>
      toMonitored('publicApi.navigateToSection', () =>
        getPublicAPI().navigateToSection(sectionData, onError),
      )(),
    navigateToMember: (memberInfo, onError) =>
      toMonitored('publicApi.navigateToMember', () =>
        getPublicAPI().navigateToMember(memberInfo, onError),
      )(),
    getNavigatableRoles: (onError) =>
      toMonitored('publicApi.getNavigatableRoles', () =>
        getPublicAPI().getNavigatableRoles(onError),
      )(),
    getSectionUrl: (sectionData, onError) =>
      toMonitored('publicApi.getSectionUrl', () =>
        getPublicAPI().getSectionUrl(sectionData, onError),
      )(),
    getMemberPagePrefix: (data, onSuccess, onError) =>
      toMonitored('publicApi.getMemberPagePrefix ', () =>
        getPublicAPI().getMemberPagePrefix(data, onSuccess, onError),
      )(),
    setNotificationCount: (displayCount) =>
      toMonitored('publicApi.setNotificationCount', () =>
        getPublicAPI().setNotificationCount(displayCount),
      )(),
    enterPublicProfilePreviewMode: () =>
      toMonitored('publicApi.enterPublicProfilePreviewMode', async () => {
        const profilePageBobPublicAPI = await getProfilePageBobPublicAPI();
        return profilePageBobPublicAPI.enterPublicProfilePreviewMode();
      })(),
    leavePublicProfilePreviewMode: () =>
      toMonitored('publicApi.leavePublicProfilePreviewMode', async () => {
        const profilePageBobPublicAPI = await getProfilePageBobPublicAPI();
        return profilePageBobPublicAPI.leavePublicProfilePreviewMode();
      })(),
    openBlockedMemberEmptyState: () =>
      toMonitored('publicApi.openBlockedMemberEmptyState', async () => {
        const profilePageBobPublicAPI = await getProfilePageBobPublicAPI();
        return profilePageBobPublicAPI.openBlockedMemberEmptyState();
      })(),
    clearMenus: () =>
      toMonitored('publicApi.clearMenus', async () => {
        const profilePageBobPublicAPI = await getProfilePageBobPublicAPI();
        return profilePageBobPublicAPI.clearMenus();
      })(),
    getRoutes: (onSuccess) =>
      toMonitored('publicApi.getRoutes', () =>
        getPublicAPI().getRoutes(onSuccess),
      )(),
    getIsMembersAreaSeoEnabled: () =>
      toMonitored('publicApi.getIsMembersAreaSeoEnabled', () =>
        getPublicAPI().getIsMembersAreaSeoEnabled(),
      )(),
    isAppSectionInstalled: (sectionData) =>
      toMonitored('publicApi.isAppSectionInstalled', () =>
        getPublicAPI().isAppSectionInstalled(sectionData),
      )(),
  };
};
