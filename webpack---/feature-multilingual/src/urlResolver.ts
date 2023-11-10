import { ResolutionMethod } from '@wix/thunderbolt-ssr-api'
import { decodeUriComponentIfEncoded } from 'feature-router'

type UrlResolverParams = {
	url: URL
	baseUrl: string
	nextLanguageCode?: string
	currentLanguageCode: string
	nextResolutionMethod: ResolutionMethod
	currentResolutionMethod: ResolutionMethod
	currentPageUriSeo: string
	nextPageUriSeo: string
	shouldTranslateURL?: boolean | string | undefined
}

type ModifierMapper<T extends keyof UrlResolverParams> = {
	[key in ResolutionMethod]: (params: Pick<UrlResolverParams, T>) => void
}

const removalMapper: ModifierMapper<'url' | 'currentLanguageCode'> = {
	Subdomain: ({ url, currentLanguageCode }) => {
		url.hostname = url.hostname.replace(new RegExp(`^${currentLanguageCode}\\.`), 'www.')
	},
	QueryParam: ({ url }) => {
		url.searchParams.delete('lang')
	},
	Subdirectory: ({ url, currentLanguageCode }) => {
		/**
		 * match: mysite/en/my-page
		 * match: mysite/en
		 * don't match: mysite/english
		 */
		url.pathname = url.pathname.replace(new RegExp(`(/${currentLanguageCode})($|/)`), '$2')
	},
}

const addMapper: ModifierMapper<'url' | 'baseUrl' | 'nextLanguageCode'> = {
	Subdomain: ({ url, nextLanguageCode }) => {
		if (!nextLanguageCode) {
			return
		}
		url.hostname = url.hostname.replace('www', nextLanguageCode)
	},
	QueryParam: ({ url, nextLanguageCode }) => {
		if (!nextLanguageCode) {
			return
		}
		url.searchParams.set('lang', nextLanguageCode)
	},
	Subdirectory: ({ url, baseUrl, nextLanguageCode }) => {
		if (!nextLanguageCode) {
			return
		}

		const siteName = utils.getSiteName(baseUrl)

		const [, relativePath] = url.href.split(/[?|#]/)[0].split(`${baseUrl}/`)
		url.pathname = [siteName, nextLanguageCode, relativePath].filter(Boolean).join('/')
	},
}

const utils = {
	getSiteName: (baseUrl: string) => utils.removeTralingSlash(new URL(baseUrl).pathname),
	removeTralingSlash: (path: string) => path.replace(/\/$/, ''),
}

const removeCurrentLanguageIndiction = (
	url: URL,
	currentLanguageCode: string,
	currentResolutionMethod: ResolutionMethod
) => {
	removalMapper[currentResolutionMethod]({ url, currentLanguageCode })
}

const addLanguageIndication = (
	url: URL,
	baseUrl: string,
	nextResolutionMethod: ResolutionMethod,
	nextLanguageCode?: string
) => {
	addMapper[nextResolutionMethod]({ url, baseUrl, nextLanguageCode })
}

const getNextUrlByLang = (currentPageUriSEO: string, href: string, nextPageUriSeo: string) => {
	if (nextPageUriSeo !== 'home') {
		return href.replace(currentPageUriSEO, `${nextPageUriSeo}`)
	}
	return href
}

export const resolveLanguageUrl = ({
	url,
	baseUrl,
	nextLanguageCode,
	currentLanguageCode,
	nextResolutionMethod,
	currentResolutionMethod,
	currentPageUriSeo,
	nextPageUriSeo,
	shouldTranslateURL,
}: UrlResolverParams) => {
	const decodedUrl = decodeUriComponentIfEncoded(url.href)
	const nextUrl = getNextUrlByLang(currentPageUriSeo, decodedUrl, nextPageUriSeo)
	const urlToClone = shouldTranslateURL ? nextUrl : url.href

	const cloneUrl = new URL(urlToClone)

	const baseUrlWithoutLang = getCleanBaseUrl({ baseUrl, currentLanguageCode })
	removeCurrentLanguageIndiction(cloneUrl, currentLanguageCode, currentResolutionMethod)
	addLanguageIndication(cloneUrl, baseUrlWithoutLang, nextResolutionMethod, nextLanguageCode)
	return cloneUrl.toString()
}

const getCleanBaseUrl = ({
	baseUrl,
	currentLanguageCode,
}: Pick<UrlResolverParams, 'baseUrl' | 'currentLanguageCode'>) => {
	const cleanBaseUrl = new URL(baseUrl)
	Object.values(removalMapper).forEach((remove) =>
		remove({
			url: cleanBaseUrl,
			currentLanguageCode,
		})
	)
	return utils.removeTralingSlash(cleanBaseUrl.toString())
}
