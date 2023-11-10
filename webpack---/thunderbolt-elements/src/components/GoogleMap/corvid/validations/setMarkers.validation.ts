import {
  assert,
  messageTemplates,
  reportError,
  createCompSchemaValidator,
} from '@wix/editor-elements-corvid-utils';
import type { CorvidSDKApi } from '@wix/editor-elements-types/corvid';
import type { GoogleMapSDK } from '../../GoogleMap.types';

const isExternalUrl = (url: string) => {
  return /^(?:(?:https?:)\/\/)(?:(?:[\u0400-\uA69F\w][\u0400-\uA69F\w-]*)?[\u0400-\uA69F\w]\.)+(?:[\u0400-\uA69Fa-z]+|\d{1,3})(?::[\d]{1,5})?(?:[/?#].*)?$/i.test(
    url,
  );
};

const validateMarkerSchema = (value: GoogleMapSDK['markers'][0]) => {
  if (value.link && !isExternalUrl(value.link)) {
    reportError(
      messageTemplates.error_type({
        propertyName: 'link',
        functionName: 'marker',
        value: value.link,
        expectedType: 'url',
      }),
    );
    return false;
  }

  if (value.title && !assert.isString(value.title)) {
    reportError(
      messageTemplates.error_type({
        propertyName: 'title',
        functionName: 'marker',
        value: value.title,
        expectedType: 'string',
      }),
    );
    return false;
  }

  if (value.description && !assert.isString(value.description)) {
    reportError(
      messageTemplates.error_type({
        propertyName: 'description',
        functionName: 'marker',
        value: value.description,
        expectedType: 'string',
      }),
    );
    return false;
  }

  if (value.icon && !assert.isString(value.icon)) {
    reportError(
      messageTemplates.error_type({
        propertyName: 'icon',
        functionName: 'marker',
        value: value.icon,
        expectedType: 'string',
      }),
    );
    return false;
  }

  if (value.linkTitle && !assert.isString(value.linkTitle)) {
    reportError(
      messageTemplates.error_type({
        propertyName: 'linkTitle',
        functionName: 'marker',
        value: value.linkTitle,
        expectedType: 'string',
      }),
    );
    return false;
  }

  return true;
};

export const isLocationObject = (
  location: { latitude: number; longitude: number } | undefined,
) => {
  return (
    assert.isObject(location) &&
    assert.isNumber(location.latitude) &&
    assert.isNumber(location.longitude)
  );
};

export const validateLocationSchema = (
  value: GoogleMapSDK['markers'][0]['location'],
  api: CorvidSDKApi<object, object>,
) =>
  createCompSchemaValidator(api.metaData.compId)(
    value,
    {
      type: ['object'],
      properties: {
        latitude: {
          type: ['number'],
          minimum: -90,
          maximum: 90,
        },
        longitude: {
          type: ['number'],
          minimum: -180,
          maximum: 180,
        },
      },
    },
    'location',
  );

export const validateMarkerLocation = (
  marker: GoogleMapSDK['markers'][0],
  index = 0,
  api: CorvidSDKApi<object, object>,
) => {
  const { location, address } = marker;

  const validAddress = assert.isString(address) && address.length > 0;

  const validLocation =
    isLocationObject(location) && validateLocationSchema(location, api);

  if (!validAddress && !validLocation) {
    reportError(
      messageTemplates.error_invalid_location({
        propertyName: 'location',
        index: index.toString(),
        wrongValue: JSON.stringify(location),
      }),
    );
    return false;
  }

  return true;
};

const isMarkersNonEmptyArray = (markers: GoogleMapSDK['markers']) => {
  if (!assert.isArray(markers) || markers.length === 0) {
    reportError(
      messageTemplates.error_invalid_markers({
        wrongValue: JSON.stringify(markers),
      }),
    );
    return false;
  }

  return true;
};

export const areMarkersValid = (
  markers: GoogleMapSDK['markers'],
  api: CorvidSDKApi<object, object>,
): boolean => {
  return (
    isMarkersNonEmptyArray(markers) &&
    markers.every(
      (marker, index) =>
        validateMarkerLocation(marker, index, api) &&
        validateMarkerSchema(marker),
    )
  );
};
