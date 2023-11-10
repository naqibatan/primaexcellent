import { IHttpClient } from '@wix/yoshi-flow-editor';
import {
  getRouteConfigurationByWidgetId,
  queryRouteConfigurations,
} from '@wix/ambassador-members-routes-v1-route-configuration/http';
import { WidgetId } from '@wix/members-area-app-definitions';

import {
  RouteConfiguration,
  RoutesConfigurationService as IRoutesConfigurationService,
} from '../types';

export class RoutesConfigurationService implements IRoutesConfigurationService {
  constructor(private httpClient: IHttpClient) {}

  async fetchRouteConfigurations() {
    const { data } = await this.httpClient.request(
      queryRouteConfigurations({}),
    );

    return (data.routeConfigurations ?? []) as RouteConfiguration[];
  }

  async getRouteConfiguration(widgetId: WidgetId) {
    const { data } = await this.httpClient.request(
      getRouteConfigurationByWidgetId({ routeConfigurationWidgetId: widgetId }),
    );

    return data.routeConfiguration as RouteConfiguration | undefined;
  }
}
