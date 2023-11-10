import { named, withDependencies } from '@wix/thunderbolt-ioc'
import {
	CompsLifeCycleSym,
	DomReadySymbol,
	Experiments,
	ExperimentsSymbol,
	ICompsLifeCycle,
	IPageWillMountHandler,
	IPageWillUnmountHandler,
	PageFeatureConfigSymbol,
} from '@wix/thunderbolt-symbols'
import type { GetScreenInInitCallback } from './types'
import { name, SCREEN_IN_CALLBACK, ScreenInInitCallbackSymbol } from './symbols'
import { ScreenInPageConfig } from './types'

export const ScreenInInit = withDependencies(
	[
		named(PageFeatureConfigSymbol, name),
		ScreenInInitCallbackSymbol,
		CompsLifeCycleSym,
		DomReadySymbol,
		ExperimentsSymbol,
	],
	(
		featureConfig: ScreenInPageConfig,
		getScreenInInitCallback: GetScreenInInitCallback,
		compsLifeCycle: ICompsLifeCycle,
		domReadyPromise: Promise<void>,
		experiments: Experiments
	): IPageWillMountHandler | IPageWillUnmountHandler => {
		let unregisterFromCompLifeCycle = () => {}

		return {
			name: 'screenInInit',
			pageWillMount() {
				const animatedIdsOnDomReady = new Set<string>()
				const initCallback = getScreenInInitCallback()

				if (!initCallback) {
					return
				}

				const compIds = Object.keys(featureConfig.compIdToActions || {})

				const registerToCompDidMount = () =>
					compsLifeCycle.registerToCompLifeCycle(
						compIds,
						SCREEN_IN_CALLBACK,
						(compId: string, displayedId: string, dom: HTMLElement | null) => {
							// delete from set, so we can run screenIn animation again if component is un-mounted and re-mounted
							if (animatedIdsOnDomReady.has(displayedId)) {
								animatedIdsOnDomReady.delete(displayedId)
								return
							}

							initCallback(compId, displayedId, dom)
						}
					)

				// run screenIn animations on domReady
				if (experiments['specs.thunderbolt.screenInBeforeHydration']) {
					domReadyPromise.then(() => {
						compIds.forEach((compId) => {
							const elements = document.querySelectorAll(`[id^=${compId}]`)
							if (elements.length) {
								elements.forEach((element) => {
									const displayedId = element.id
									initCallback(compId, displayedId, element as HTMLElement)
									// avoid running screenIn animation again on compDidMount
									animatedIdsOnDomReady.add(displayedId)
								})
							}
						})

						// if component is un-mounted and re-mounted, we want to run screenIn animation again (for example, in slides)
						unregisterFromCompLifeCycle = registerToCompDidMount()
					})
				} else {
					unregisterFromCompLifeCycle = registerToCompDidMount()
				}
			},
			pageWillUnmount() {
				unregisterFromCompLifeCycle()
			},
		}
	}
)
