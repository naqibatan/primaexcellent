import {
	getDefaultItemPayload,
	getTitle,
	getMetaTags,
	getCanonical,
	renderToStaticMarkup,
	setDescription,
	setLinks,
	setMetaTags,
	setSchemas,
	setTitle,
	isComponentItemType,
	ITEM_TYPES,
} from '@wix/advanced-seo-utils/renderer'
import { SeoSchema } from '@wix/advanced-seo-utils'
import { convertDynamicPageModel, setExternalRouter } from '@wix/advanced-seo-utils/renderer-api'
import { getTags } from '@wix/advanced-seo-utils/async'
import { DynamicRouteData } from '@wix/thunderbolt-symbols'
import { resolveMetaTags } from './resolve-meta-tags'
import { OgTags, TwitterTags, BasicMetaTags, MetaTag, MethodOptions, AttributeDescriptor } from '../types'
import { setTagToDOM } from './utils'

export { resolveWixImageUrlsInItemData } from './resolve-wix-image-urls-in-item-data'
export {
	getTags,
	getDefaultItemPayload,
	getTitle,
	setTitle,
	setLinks,
	setSchemas,
	setMetaTags,
	setDescription,
	isComponentItemType,
	ITEM_TYPES,
}

export const setWindowTitle = (title: string) => {
	if (process.env.browser) {
		window.document.title = title
	}
}

export const setSocialTagsToDOM = (tags: SeoSchema) => {
	if (process.env.browser) {
		setMetaTagsToDom(Object.values(BasicMetaTags), 'name')
		setMetaTagsToDom(Object.values(OgTags), 'property')
		setMetaTagsToDom(Object.values(TwitterTags), 'name')
		setCanonicalToDOM()
	}

	function setMetaTagsToDom(tagDescriptors: Array<string>, attribute: AttributeDescriptor): void {
		tagDescriptors.forEach((tagDescriptor) => {
			const [metaTag]: Array<MetaTag> = getMetaTags(tags, { [attribute]: tagDescriptor })
			if (metaTag) {
				setTagToDOM({
					type: 'meta',
					name: { key: attribute, value: tagDescriptor },
					content: { key: 'content', value: metaTag.content },
				})
			}
		})
	}

	function setCanonicalToDOM() {
		const canonicalUrl = getCanonical(tags)
		if (canonicalUrl) {
			setTagToDOM({
				type: 'link',
				name: { key: 'rel', value: 'canonical' },
				content: { key: 'href', value: canonicalUrl },
			})
		}
	}
}

export const getStaticMarkup = (tags: any, options: MethodOptions) => renderToStaticMarkup(tags, options).join('\n  ') // indenting every tag for final render

export const convertTPAEndpointModel = async (tpaEnapointData: any) => {
	const converters = await import('@wix/advanced-seo-utils/converters' /* webpackChunkName: "seo-api-converters" */)
	return converters.convertTpaModel(tpaEnapointData)
}

export const extractDynamicRouteData = (
	payload: DynamicRouteData,
	mediaItemUtils: any,
	currentVeloOverrides: Array<MetaTag> = []
) => {
	if (payload) {
		const { pageHeadData = {} } = payload
		const resolvedPageHeadData = {
			...pageHeadData,
			metaTags: resolveMetaTags(pageHeadData.metaTags || {}, mediaItemUtils),
		}
		const veloOverrides = setExternalRouter(currentVeloOverrides, resolvedPageHeadData)
		const dynamicPageData = convertDynamicPageModel(resolvedPageHeadData)
		return {
			veloOverrides,
			dynamicPageData,
		}
	}
}
