import { named, withDependencies, optional } from '@wix/thunderbolt-ioc'
import {
	DynamicPagesAPI,
	FetchParams,
	ICurrentRouteInfo,
	IRoutingMiddleware,
	IUrlHistoryManager,
	UrlHistoryManagerSymbol,
} from 'feature-router'
import { getCSRFToken } from '@wix/thunderbolt-commons'
import {
	BrowserWindow,
	BrowserWindowSymbol,
	Fetch,
	IFetchApi,
	SiteFeatureConfigSymbol,
	IMultilingual,
	CurrentRouteInfoSymbol,
	ExperimentsSymbol,
	Experiments,
} from '@wix/thunderbolt-symbols'
import { ISessionManager, SessionManagerSymbol } from 'feature-session-manager'
import type {
	DynamicPagesSiteConfig,
	IDynamicPagesResponseHandler,
	IDynamicPagesWarmupData,
	IPermissionsHandlerProvider,
	RouterFetchData,
} from './types'
import { DynamicPagesResponseHandlerSymbol, name, PermissionsHandlerProviderSymbol } from './symbols'
import { errorPagesIds, getRouterPrefix, getRouterSuffix } from './utils'
import { CommonConfigSymbol, ICommonConfig } from 'feature-common-config'
import { MultilingualSymbol } from 'feature-multilingual'
import { IWarmupDataProvider, WarmupDataProviderSymbol } from 'feature-warmup-data'

enum DynamicRequestTypes {
	PAGES = 'pages',
	SITEMAP = 'sitemap',
}

const addQueryParam = (url: string, paramName: string, paramValue: string): string => {
	const parsedUrl = new URL(url)
	parsedUrl.searchParams.append(paramName, paramValue)

	return parsedUrl.toString()
}

export const DynamicPages = withDependencies(
	[
		named(SiteFeatureConfigSymbol, name),
		SessionManagerSymbol,
		Fetch,
		UrlHistoryManagerSymbol,
		DynamicPagesResponseHandlerSymbol,
		PermissionsHandlerProviderSymbol,
		BrowserWindowSymbol,
		CommonConfigSymbol,
		CurrentRouteInfoSymbol,
		WarmupDataProviderSymbol,
		ExperimentsSymbol,
		optional(MultilingualSymbol),
	],
	(
		{ prefixToRouterFetchData, routerPagesSeoToIdMap, externalBaseUrl, viewMode }: DynamicPagesSiteConfig,
		sessionManager: ISessionManager,
		fetchApi: IFetchApi,
		urlHistoryManager: IUrlHistoryManager,
		{ handleResponse }: IDynamicPagesResponseHandler,
		permissionsHandlerProvider: IPermissionsHandlerProvider,
		window: BrowserWindow,
		commonConfigAPI: ICommonConfig,
		currentRouteInfo: ICurrentRouteInfo,
		warmupDataProvider: IWarmupDataProvider,
		experiments: Experiments,
		multiLingual?: IMultilingual
	): IRoutingMiddleware & DynamicPagesAPI => {
		const getWarmupDynamicRouteInfo = () => {
			const currentRoute = currentRouteInfo.getCurrentRouteInfo()
			if (!experiments['specs.thunderbolt.dynamicPagesWarmupData2'] || currentRoute) {
				return null
			}

			// we don't want to wait for it, only use it if we already have it (i.e. documentReady)
			return warmupDataProvider.getWarmupData<IDynamicPagesWarmupData>(name, { timeout: 0 })
		}

		const getData = (routerFetchData: RouterFetchData, relativeEncodedUrl: string, queryParams: string) => {
			const { routerPrefix, config, pageRoles, roleVariations } = routerFetchData.optionsData.bodyData
			const routerSuffix = getRouterSuffix(relativeEncodedUrl)
			const fullUrl = `${externalBaseUrl}${routerPrefix}${routerSuffix}${queryParams}`

			return JSON.stringify({
				routerPrefix,
				routerSuffix,
				fullUrl,
				config,
				pageRoles,
				roleVariations,
				requestInfo: {
					env: process.env.browser ? 'browser' : 'backend',
					formFactor: viewMode,
				},
			})
		}

		const getHeaders = (routerFetchData: RouterFetchData) => {
			// Hard coded UUID for multilingual support https://wix.slack.com/archives/C04BFK71QHW/p1676992832913939 .
			const multiLingualUUID = '00000000-0000-0000-0000-000000000000'

			return {
				...(process.env.PACKAGE_NAME === 'thunderbolt-ds'
					? {}
					: { commonConfig: JSON.stringify(commonConfigAPI.getCommonConfig()) }),
				...routerFetchData.optionsData.headers,
				...(multiLingual
					? {
							'x-wix-linguist': `${multiLingual!.currentLanguage.languageCode}|${
								multiLingual!.currentLanguage.locale
							}|${multiLingual!.currentLanguage.isPrimaryLanguage}|${multiLingualUUID}`,
					  }
					: {}),
			}
		}

		const getFetchParams = (
			routerFetchData: RouterFetchData,
			relativeEncodedUrl: string,
			extraQueryParams: string,
			requestType: DynamicRequestTypes
		): FetchParams => {
			const { basePath, queryParams, appDefinitionId } = routerFetchData.urlData
			const url = `${basePath}/${requestType}?${queryParams}`
			const instance = sessionManager.getAppInstanceByAppDefId(appDefinitionId) as string
			const urlWithInstance = addQueryParam(url, 'instance', instance)
			const authorizationHeader = sessionManager.getAppInstanceByAppDefId(routerFetchData.wixCodeAppDefinitionId)
			if (authorizationHeader) {
				routerFetchData.optionsData.headers!['Authorization' as string] = authorizationHeader
			}
			if (process.env.browser) {
				routerFetchData.optionsData.headers!['X-XSRF-TOKEN' as string] = getCSRFToken(window?.document?.cookie)
			}

			const shouldSendGETRequest =
				!!experiments['specs.thunderbolt.dynamicPagesReplacePostWithGet'] && queryParams.includes('gridAppId')
			const method = shouldSendGETRequest ? 'GET' : 'POST'
			const data = getData(routerFetchData, relativeEncodedUrl, extraQueryParams)
			const urlWithPayload = addQueryParam(url, 'payload', data)
			const requestUrl = shouldSendGETRequest ? urlWithPayload : urlWithInstance

			return {
				url: requestUrl,
				options: {
					method,
					headers: getHeaders(routerFetchData),
					...(shouldSendGETRequest ? {} : { body: data }),
					...(routerFetchData.optionsData.credentials
						? { credentials: routerFetchData.optionsData.credentials }
						: {}),
					...(routerFetchData.optionsData.mode ? { mode: routerFetchData.optionsData.mode } : {}),
				},
			}
		}

		return {
			getSitemapFetchParams(routerPrefix) {
				const routerFetchData = prefixToRouterFetchData[routerPrefix]
				if (!routerFetchData) {
					return null
				}

				return getFetchParams(
					routerFetchData,
					urlHistoryManager.getRelativeEncodedUrl(),
					urlHistoryManager.getParsedUrl().search,
					DynamicRequestTypes.SITEMAP
				)
			},
			async handle(routeInfo) {
				if (!routeInfo.pageId && routeInfo.relativeUrl && routeInfo.parsedUrl && routeInfo.relativeEncodedUrl) {
					const routerPrefix = getRouterPrefix(routeInfo.relativeUrl)
					const routerFetchData = prefixToRouterFetchData[routerPrefix]

					if (!routerFetchData) {
						if (routerPagesSeoToIdMap[routerPrefix]) {
							return {
								...routeInfo,
								pageId: errorPagesIds.NOT_FOUND,
							}
						}
						return routeInfo
					}

					const warmupDynamicRouteInfo = await getWarmupDynamicRouteInfo()
					if (warmupDynamicRouteInfo) {
						return {
							...routeInfo,
							...warmupDynamicRouteInfo,
						}
					}

					const { url, options } = getFetchParams(
						routerFetchData,
						routeInfo.relativeEncodedUrl,
						routeInfo.parsedUrl.search,
						DynamicRequestTypes.PAGES
					)

					const routeInfoFromResponsePromise = handleResponse(fetchApi.envFetch(url, options), routeInfo)
					return permissionsHandlerProvider.getHandler().handle(routeInfoFromResponsePromise, routeInfo)
				}

				return routeInfo
			},
		}
	}
)
