import { buildOgImagePreviewUrl } from '@wix/advanced-seo-utils/renderer-api'
import { MetaTag } from '../types'

export const isWixImage = (url = ''): boolean => url.startsWith('wix:image:') || url.startsWith('image:')

export const transformWixImageToPublicURL = (wixImageUri: string, mediaItemUtils: any) => {
	if (!isWixImage(wixImageUri)) {
		return wixImageUri
	}
	const parsedUri = mediaItemUtils.parseMediaItemUri(wixImageUri)
	const { error, mediaId, width, height, title } = parsedUri
	return error ? '' : buildOgImagePreviewUrl({ url: mediaId, width, height, method: 'fill', name: title })
}

export const hasWixImage = (urls: Array<string>): boolean => urls.some((url) => isWixImage(url))

export const resolveWixImage = (metaTags: Array<MetaTag>, mediaItemUtils: any): Array<MetaTag> =>
	metaTags.map((tag) =>
		isWixImage(tag.content) ? { ...tag, content: transformWixImageToPublicURL(tag.content, mediaItemUtils) } : tag
	)

export const resolveWixImageObj = (metaTags: Record<string, string>, mediaItemUtils: any): Record<string, string> =>
	Object.keys(metaTags).reduce((acc, curr) => {
		const value = metaTags[curr]
		acc[curr] = isWixImage(value) ? transformWixImageToPublicURL(value, mediaItemUtils) : value
		return acc
	}, {} as Record<string, string>)
