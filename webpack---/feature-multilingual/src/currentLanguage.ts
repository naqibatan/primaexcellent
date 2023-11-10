import { named, withDependencies } from '@wix/thunderbolt-ioc'
import {
	MultilingualSiteConfig,
	SiteFeatureConfigSymbol,
	BrowserWindow,
	BrowserWindowSymbol,
	CurrentRouteInfoSymbol,
	PagesMapSymbol,
	ExperimentsSymbol,
	Experiments,
} from '@wix/thunderbolt-symbols'
import { CookiesManagerSymbol, ICookiesManager } from 'feature-cookies-manager'
import { IUrlHistoryManager, UrlHistoryManagerSymbol, ICurrentRouteInfo, IPagesMap } from 'feature-router'
import { resolveLanguageUrl } from './urlResolver'
import { name } from './symbols'

export const CurrentLanguage = withDependencies(
	[
		named(SiteFeatureConfigSymbol, name),
		PagesMapSymbol,
		CookiesManagerSymbol,
		UrlHistoryManagerSymbol,
		BrowserWindowSymbol,
		CurrentRouteInfoSymbol,
		ExperimentsSymbol,
	],
	(
		siteFeatureConfig: MultilingualSiteConfig,
		pageMap: IPagesMap,
		cookieManager: ICookiesManager,
		urlHistoryManager: IUrlHistoryManager,
		browserWindow: BrowserWindow,
		currentRouteInfo: ICurrentRouteInfo,
		experiments: Experiments
	) => {
		const { siteLanguages, originalLanguage, domain, currentLanguage, baseUrl, isPremiumDomain } = siteFeatureConfig

		const getCurrentLanguage = () => currentLanguage
		const setCurrentLanguage = (languageCode: string) => {
			if (!browserWindow) {
				return
			}
			if (languageCode === currentLanguage.languageCode) {
				console.warn('setCurrentLanguage called with the same languageCode')
				return
			}
			const chosenLanguage = siteLanguages.find((lang) => lang.languageCode === languageCode)!
			if (!chosenLanguage) {
				throw new Error(`language code "${languageCode}" is invalid`)
			}

			cookieManager.writeCookie('wixLanguage', languageCode, 'functional', {
				daysExpire: 6 * 30,
				domain: isPremiumDomain ? domain : undefined,
				path: '/',
			})

			const parsedUrl = urlHistoryManager.getParsedUrl()
			const isNextLanguageOriginal = originalLanguage.languageCode === languageCode
			const shouldTranslateURL =
				experiments.useTranslatedUrlSlugs || experiments['specs.thunderbolt.slugTranslation']
			const nextLanguageCode = isNextLanguageOriginal ? undefined : languageCode
			const pageId = currentRouteInfo.getCurrentRouteInfo()?.pageId || ''

			const nextPageUriSeo = pageMap.getCurrentPageHierarchyMapping(pageId, nextLanguageCode)
			const currentPageUriSeo = pageMap.getCurrentPageHierarchyMapping(pageId, currentLanguage.languageCode)
			const getLanguageUrl = () => {
				return resolveLanguageUrl({
					baseUrl,
					url: parsedUrl,
					currentLanguageCode: currentLanguage.languageCode,
					currentResolutionMethod: currentLanguage.resolutionMethod,
					nextResolutionMethod: chosenLanguage.resolutionMethod,
					nextLanguageCode,
					currentPageUriSeo,
					nextPageUriSeo,
					shouldTranslateURL,
				})
			}
			const languageUrl = getLanguageUrl()
			browserWindow.location.assign(languageUrl)
		}

		return {
			set: setCurrentLanguage,
			get: getCurrentLanguage,
		}
	}
)
