import {
  createCompSchemaValidator,
  messageTemplates,
  reportError,
} from '@wix/editor-elements-corvid-utils';
import type { CorvidSDKApi } from '@wix/editor-elements-types/corvid';
import type {
  PinIconInterface,
  PinSymbolInterface,
  GoogleMapSDK,
} from '../../GoogleMap.types';

export const validatePinIconInterface = (
  value: PinIconInterface,
  api: CorvidSDKApi<object, object>,
) =>
  createCompSchemaValidator(api.metaData.compId)(
    value,
    {
      type: ['object'],
      properties: {
        url: {
          type: ['string', 'nil'],
        },
        anchor: {
          type: ['object', 'nil'],
          properties: {
            x: { type: ['number'] },
            y: { type: ['number'] },
          },
        },
        labelOrigin: {
          type: ['object', 'nil'],
          properties: {
            x: { type: ['number'] },
            y: { type: ['number'] },
          },
        },
        origin: {
          type: ['object', 'nil'],
          properties: {
            x: { type: ['number'] },
            y: { type: ['number'] },
          },
        },
        scaledSize: {
          type: ['object', 'nil'],
          properties: {
            width: { type: ['number'] },
            height: { type: ['number'] },
            widthUnit: { type: ['string', 'nil'] },
            heightUnit: { type: ['string', 'nil'] },
          },
        },
        size: {
          type: ['object', 'nil'],
          properties: {
            width: { type: ['number'] },
            height: { type: ['number'] },
            widthUnit: { type: ['string', 'nil'] },
            heightUnit: { type: ['string', 'nil'] },
          },
        },
      },
    },
    'location',
  );

export const validatePinSymbolInterface = (
  value: PinSymbolInterface,
  api: CorvidSDKApi<object, object>,
) =>
  createCompSchemaValidator(api.metaData.compId)(
    value,
    {
      type: ['object'],
      properties: {
        path: {
          type: ['string'],
        },
        anchor: {
          type: ['object', 'nil'],
          properties: {
            x: { type: ['number'] },
            y: { type: ['number'] },
          },
        },
        labelOrigin: {
          type: ['object', 'nil'],
          properties: {
            x: { type: ['number'] },
            y: { type: ['number'] },
          },
        },
        rotation: {
          type: ['number', 'nil'],
        },
        fillColor: {
          type: ['string', 'nil'],
        },
        fillOpacity: {
          type: ['number', 'nil'],
        },
        scale: {
          type: ['number', 'nil'],
        },
        strokeColor: {
          type: ['string', 'nil'],
        },
        strokeWeight: {
          type: ['number', 'nil'],
        },
      },
    },
    'location',
  );

export const validateCoordinatesSchema = (
  value: GoogleMapSDK['markers'][0]['location'],
) => {
  if (value?.latitude === undefined) {
    reportError(
      messageTemplates.error_bad_format_with_hint({
        propertyName: 'latitude',
        functionName: 'setMarkerIcon',
        wrongValue: 'undefined',
        hint: 'number',
      }),
    );
    return false;
  }

  if (value?.longitude === undefined) {
    reportError(
      messageTemplates.error_bad_format_with_hint({
        propertyName: 'longitude',
        functionName: 'setMarkerIcon',
        wrongValue: 'undefined',
        hint: 'number',
      }),
    );
    return false;
  }

  if (value.latitude < -90 || value.latitude > 90) {
    reportError(
      messageTemplates.error_range({
        propertyName: 'latitude',
        functionName: 'setMarkerIcon',
        value: value.latitude,
        minimum: -90,
        maximum: 90,
      }),
    );
    return false;
  }

  if (value.longitude < -180 || value.longitude > 180) {
    reportError(
      messageTemplates.error_range({
        propertyName: 'longitude',
        functionName: 'setMarkerIcon',
        value: value.longitude,
        minimum: -180,
        maximum: 180,
      }),
    );

    return false;
  }

  return true;
};

const validateIconOptionsSchema = ({
  value,
  api,
}: {
  value: (PinIconInterface & PinSymbolInterface) | undefined;
  api: CorvidSDKApi<object, object>;
}) => {
  if (!value) {
    reportError(
      messageTemplates.error_bad_format_with_hint({
        propertyName: 'url or path',
        functionName: 'setMarkerIcon',
        wrongValue: 'undefined',
        hint: 'string',
      }),
    );
    return false;
  }

  /**
   *  Icon schema defined as in Google Maps API
   * https://developers.google.com/maps/documentation/javascript/reference/marker#Icon
   */
  if (value.url) {
    return validatePinIconInterface(value, api);
  }

  /**
   * Symbol schema defined as in Google Maps API
   * https://developers.google.com/maps/documentation/javascript/reference/marker#Symbol
   */
  if (value.path) {
    return validatePinSymbolInterface(value, api);
  }

  return false;
};

export const isSetMarkerIconArgumentsValid = (
  args: [
    { latitude: number; longitude: number },
    (PinIconInterface & PinSymbolInterface) | undefined,
  ],
  api: CorvidSDKApi<object, object>,
): boolean => {
  /**
   * If coordinate object is not valid then
   * we can't know which location icon to update.
   */
  if (!validateCoordinatesSchema(args[0])) {
    return false;
  }

  /**
   * If iconOptions object is not valid then
   * then user should correct himself.
   */
  if (!validateIconOptionsSchema({ value: args[1], api })) {
    return false;
  }

  return true;
};
