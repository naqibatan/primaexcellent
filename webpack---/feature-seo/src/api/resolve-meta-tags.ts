import { MetaTag } from '../types'
import { hasWixImage, resolveWixImage, resolveWixImageObj } from './wix-image-utils'

export function resolveMetaTags(
	originalMetaTags: Array<MetaTag> | Record<string, string>,
	mediaItemUtils: any
): Array<MetaTag> | Record<string, string> {
	if (Array.isArray(originalMetaTags)) {
		return hasWixImage(originalMetaTags.map((tag) => tag.content))
			? resolveWixImage(originalMetaTags, mediaItemUtils)
			: originalMetaTags
	}
	return hasWixImage(Object.values(originalMetaTags))
		? resolveWixImageObj(originalMetaTags, mediaItemUtils)
		: originalMetaTags
}
