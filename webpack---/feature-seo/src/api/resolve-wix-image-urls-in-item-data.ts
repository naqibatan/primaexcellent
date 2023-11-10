import { WixDataPayload, ImageValue, VideoValue } from '@wix/thunderbolt-symbols'
import { transformWixImageToPublicURL } from './wix-image-utils'

export const resolveWixImageUrlsInItemData = async (payload: WixDataPayload): Promise<WixDataPayload> => {
	if (!payload?.collections?.length) {
		return payload
	}
	const { mediaItemUtils } = await import('@wix/santa-platform-utils' /* webpackChunkName: "santa-platform-utils" */)
	const updatedCollections = payload.collections.map((collection) => {
		const updatedFields = collection.fields.map((field) => {
			if (field.type === 'image') {
				return {
					...field,
					value: {
						...(field.value as ImageValue),
						url: transformWixImageToPublicURL((field.value as ImageValue)?.url, mediaItemUtils),
					},
				}
			}
			if (field.type === 'video') {
				return {
					...field,
					value: {
						...(field.value as VideoValue),
						thumbnailUrl: transformWixImageToPublicURL(
							(field.value as VideoValue)?.thumbnailUrl,
							mediaItemUtils
						),
					},
				}
			}
			return field
		})
		return { ...collection, fields: updatedFields }
	})
	return { ...payload, collections: updatedCollections }
}
