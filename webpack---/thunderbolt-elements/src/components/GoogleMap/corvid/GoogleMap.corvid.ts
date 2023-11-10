import {
  withValidation,
  assert,
  composeSDKFactories,
  registerCorvidEvent,
  createElementPropsSDKFactory,
  toJSONBase,
} from '@wix/editor-elements-corvid-utils';
import { createComponentSDKModel } from '@wix/editor-elements-integrations/corvid';
import {
  IGoogleMapSDKFactory,
  GoogleMapSDKFactory,
  OnMarkerClickedComponentPayload,
  OnMarkerClickedCorvidEvent,
  OnMapClickedComponentPayload,
  OnMapClickedCorvidEvent,
  GoogleMapMarker,
  GoogleMapProps,
} from '../GoogleMap.types';
import {
  isLocationObject,
  areMarkersValid,
} from './validations/setMarkers.validation';
import { isSetMarkerIconArgumentsValid } from './validations/setMarkerIcon.validation';
import { getLinkObject } from './utils';

export const _googleMapSDKFactory: GoogleMapSDKFactory = api => {
  const {
    props,
    platformUtils: { linkUtils },
    compRef,
    registerEvent,
    metaData,
    createSdkState,
  } = api;
  const [state, setState] = createSdkState({
    center: {
      latitude: props.mapData.locations[props.mapData.defaultLocation].latitude,
      longitude:
        props.mapData.locations[props.mapData.defaultLocation].longitude,
    },
    zoom: props.mapData.zoom,
    locations: props.mapData.locations,
  });

  registerEvent(
    'onUpdateCenter',
    (value: { latitude: number; longitude: number }) =>
      setState({
        center: {
          latitude: value.latitude,
          longitude: value.longitude,
        },
      }),
  );
  registerEvent('onUpdateZoom', (value: { zoom: number }) =>
    setState({ zoom: value.zoom }),
  );

  const convertMarkerToLocation = (marker: GoogleMapMarker) => {
    const resolvedLink = assert.isString(marker.link)
      ? getLinkObject(marker.link)
      : null;
    return {
      address: marker.address || '',
      latitude: marker.location?.latitude || NaN,
      longitude: marker.location?.longitude || NaN,
      title: marker.title || '',
      description: marker.description || '',
      link: resolvedLink,
      linkTitle: marker.linkTitle || '',
      pinIcon: marker.icon || '',
      pinColor: '',
      locationLinkAttributes: resolvedLink
        ? linkUtils.getLinkProps(resolvedLink.url, resolvedLink.target)
        : {},
    };
  };
  const convertMarkersToLocations = (markers: Array<GoogleMapMarker>) => {
    return markers.map(marker => convertMarkerToLocation(marker));
  };

  const mergeMarkerData = (
    coordinates: { latitude: number; longitude: number },
    data: GoogleMapProps['mapData']['locations'][0],
  ) =>
    state.locations.map(location => {
      if (
        location.latitude === coordinates.latitude &&
        location.longitude === coordinates.longitude
      ) {
        return { ...location, ...data };
      }
      return location;
    });

  return {
    get location() {
      return {
        latitude: state.locations[0].latitude,
        longitude: state.locations[0].longitude,
        description: state.locations[0].title,
      };
    },

    set location(location) {
      const locations = Array.from(state.locations);

      locations[0] = {
        ...locations[0],
        title: assert.isNil(location.description) ? '' : location.description,
        latitude: location.latitude ?? locations[0].latitude,
        longitude: location.longitude ?? locations[0].longitude,
      };

      setState({ locations });
      compRef.setMarkers(locations);
    },

    get markers() {
      return state.locations.map(location => ({
        address: location.address,
        location: {
          longitude: location.longitude,
          latitude: location.latitude,
        },
        icon: location.pinIcon,
        link: assert.isObject(location.locationLinkAttributes)
          ? location.locationLinkAttributes.href
          : null,
        title: location.title,
        linkTitle: location.linkTitle,
        description: location.description,
      }));
    },

    set markers(markers) {
      const locations = convertMarkersToLocations(markers);
      setState({ locations });
      compRef.setMarkers(locations, { openInfoWindow: true });
    },

    async setMarkers(markers) {
      const locations = convertMarkersToLocations(markers);
      setState({ locations });
      return compRef.setMarkers(locations);
    },

    setCenter({ longitude, latitude }) {
      if (!isLocationObject({ longitude, latitude })) {
        return;
      }
      return compRef.setMapCenter(longitude, latitude);
    },

    get center() {
      return state.center;
    },

    setZoom(zoom) {
      return compRef.setMapZoom(zoom);
    },

    get zoom() {
      return state.zoom;
    },

    fitBounds(bounds) {
      return compRef.fitBounds(bounds);
    },

    setMarkerIcon(coordinates, iconOptions) {
      const updatedLocations = mergeMarkerData(coordinates, {
        /**
         * This is a temporary solution until we will
         * update thunderbolt mapper types to support extended
         * version of icon object.
         */
        // @ts-expect-error
        pinIcon: iconOptions,
      });
      setState({ locations: updatedLocations });
      return compRef.setMarkerIcon({
        coordinates,
        iconOptions,
        locations: updatedLocations,
      });
    },

    onMarkerClicked: cb =>
      registerCorvidEvent<
        OnMarkerClickedComponentPayload,
        OnMarkerClickedCorvidEvent
      >('onMarkerClicked', api, cb, ({ componentEvent }) => componentEvent),

    onMapClicked: cb =>
      registerCorvidEvent<
        OnMapClickedComponentPayload,
        OnMapClickedCorvidEvent
      >('onMapClicked', api, cb, ({ componentEvent }) => componentEvent),

    getVisibleMarkers() {
      return compRef.getVisibleMarkers();
    },

    toJSON() {
      return {
        ...toJSONBase(metaData),
        location: {
          latitude: state.locations[0].latitude,
          longitude: state.locations[0].longitude,
          description: state.locations[0].title,
        },
      };
    },
  };
};

const latitudeSchema = {
  type: ['number' as const],
  maximum: 90,
  minimum: -90,
  warnIfNil: true,
};

const longitudeSchema = {
  type: ['number' as const],
  maximum: 180,
  minimum: -180,
  warnIfNil: true,
};

const googleMapSDKFactory = withValidation(
  _googleMapSDKFactory,
  {
    type: ['object'],
    properties: {
      location: {
        type: ['object'],
        properties: {
          latitude: latitudeSchema,
          longitude: longitudeSchema,
          description: {
            type: ['string', 'nil'],
            warnIfNil: true,
          },
        },
      },
      setCenter: {
        type: ['function'],
        args: [
          {
            type: ['object'],
            properties: {
              latitude: latitudeSchema,
              longitude: longitudeSchema,
            },
          },
        ],
      },
      fitBounds: {
        type: ['function'],
        args: [
          {
            type: ['object'],
            properties: {
              north: {
                type: ['number'],
                maximum: 180,
                minimum: -180,
              },
              east: {
                type: ['number'],
                maximum: 180,
                minimum: -180,
              },
              south: {
                type: ['number'],
                maximum: 180,
                minimum: -180,
              },
              west: {
                type: ['number'],
                maximum: 180,
                minimum: -180,
              },
            },
          },
        ],
      },
      setZoom: {
        type: ['function'],
        args: [{ type: ['number'] }],
      },
      setMarkers: {
        type: ['function'],
        args: [{ type: ['array'] }],
      },
    },
  },
  {
    location: [isLocationObject],
    markers: [areMarkersValid],
    setMarkers: [(args, api) => areMarkersValid(args[0], api)],
    setMarkerIcon: [(args, api) => isSetMarkerIconArgumentsValid(args, api)],
  },
);

const elementPropsSDKFactory = createElementPropsSDKFactory();

export const sdk: IGoogleMapSDKFactory = composeSDKFactories([
  elementPropsSDKFactory,
  googleMapSDKFactory,
]);

export default createComponentSDKModel(sdk);
