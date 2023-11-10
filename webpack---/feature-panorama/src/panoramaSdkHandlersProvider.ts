import { withDependencies } from '@wix/thunderbolt-ioc'
import { PanoramaSdkHandlers, SdkHandlersProvider } from '@wix/thunderbolt-symbols'

export const panoramaSdkHandlersProvider = withDependencies(
	[],
	(): SdkHandlersProvider<PanoramaSdkHandlers> => {
		return {
			getSdkHandlers: () => ({
				panorama: {
					onUnhandledError: (handler: (error: Error) => void) => {
						;(window.Sentry as any).onLoad(() => {
							;(window.Sentry as any).addGlobalEventProcessor((event: any, hint: any) => {
								if (event.exception.values[0]?.mechanism.handled) {
									return event
								}

								handler(hint.originalException)

								return null
							})
						})
					},
				},
			}),
		}
	}
)
