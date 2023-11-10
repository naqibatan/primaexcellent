import { withCompInfo } from '@wix/editor-elements-integrations';
import type { DeviceType } from '@wix/thunderbolt-ssr-api';
import type {
  AnyCompDef,
  CompInfo,
} from '@wix/editor-elements-types/thunderbolt';
import {
  CONSENT_POLICY_NAMESPACE,
  translationKeysMap,
  shouldExportCurrentConsentPolicyExperiment,
  translationKeys,
} from '../constants';
import {
  CookieConsentTypes,
  TooltipSize,
  ConsentPolicyControllerProps,
  CookieConsentRefValues,
  ConsentPolicyWrapperTranslationsValues,
  ConsentPolicyMapperProps,
  ConsentPolicyWrapperTranslationsKeys,
} from '../ConsentPolicyWrapper.types';

export const parseElementText = (
  cookiesNeeded: Array<CookieConsentTypes>,
  componentName: string,
  textSize: TooltipSize,
  translationsValues: ConsentPolicyWrapperTranslationsValues,
) => {
  const oneCookieText =
    translationsValues[
      `${textSize}_element_one_cookie` as keyof typeof translationsValues
    ] || '';
  const twoCookieText =
    translationsValues[
      `${textSize}_element_two_cookie` as keyof typeof translationsValues
    ] || '';
  let parsedText = cookiesNeeded.length === 1 ? oneCookieText : twoCookieText;

  parsedText = parsedText.replace('<%=componentname%>', componentName);
  cookiesNeeded.forEach(cookieType => {
    const cookieName = translationsValues[
      cookieType as keyof typeof translationsValues
    ] as string;

    parsedText = parsedText.replace('<%=cookietype%>', cookieName);
  });

  return parsedText;
};

export const parseTooltipText = (
  componentName: string,
  textSize: TooltipSize,
  cookiesNeeded: Array<CookieConsentTypes>,
  translationsValues: ConsentPolicyWrapperTranslationsValues,
) => {
  const oneCookieText =
    translationsValues[
      `${textSize}_tooltip_one_cookie` as keyof typeof translationsValues
    ] || '';

  const twoCookieText =
    translationsValues[
      `${textSize}_tooltip_two_cookie` as keyof typeof translationsValues
    ] || '';

  let parsedText = cookiesNeeded.length === 1 ? oneCookieText : twoCookieText;
  cookiesNeeded.forEach(cookieType => {
    const cookieName =
      translationsValues[cookieType as keyof typeof translationsValues] || '';

    parsedText = parsedText.replace('<%=cookietype%>', cookieName);
  });
  return parsedText.replace('<%=componentname%>', componentName);
};

export const parseAriaLabelText = (
  componentName: string,
  textSize: TooltipSize,
  translationsValues: ConsentPolicyWrapperTranslationsValues,
) => {
  const ariaLabelText =
    translationsValues[
      `${textSize}_element_aria_label` as keyof typeof translationsValues
    ] || '';

  return ariaLabelText.replace('<%=componentname%>', componentName);
};

export const parseTextWithLinks = (text: string) => {
  const urlRegexp = new RegExp('<url>.*?<url>', 'g');
  const urlTextRegexp = new RegExp('(?<=<url>)(.*?)(?=<url>)', 'g');
  const matchedUrls = [...text.matchAll(urlRegexp)];

  const firstUrl = matchedUrls[0] ? matchedUrls[0][0] : '';
  const firstUrlText = firstUrl?.match(urlTextRegexp);
  const firstUrlSize = firstUrl ? firstUrl.length : 0;
  const firstUrlIndex = firstUrl ? text.indexOf(firstUrl) : text.length;

  const secondUrl = matchedUrls[1] ? matchedUrls[1][0] : '';
  const secondUrlText = secondUrl?.match(urlTextRegexp);
  const secondUrlSize = secondUrl ? secondUrl.length : 0;
  const secondUrlIndex = secondUrl ? text.indexOf(secondUrl) : text.length;

  const firstText = text.substring(0, firstUrlIndex);
  const secondText = text.substring(
    firstUrlIndex + firstUrlSize,
    secondUrlIndex,
  );
  const thirdText = text.substring(secondUrlIndex + secondUrlSize, text.length);

  return {
    firstText,
    firstUrlText: firstUrlText ? firstUrlText[0] : '',
    secondText,
    secondUrlText: secondUrlText ? secondUrlText[0] : '',
    thirdText,
  };
};

export const getConsentWrapperTexts = (
  cookiesNeeded: Array<CookieConsentTypes>,
  componentName: string,
  translationsValues: ConsentPolicyWrapperTranslationsValues,
) => {
  const largeText = parseElementText(
    cookiesNeeded,
    componentName,
    'large',
    translationsValues,
  );
  const mediumText = parseElementText(
    cookiesNeeded,
    componentName,
    'medium',
    translationsValues,
  );
  const smallText = parseElementText(
    cookiesNeeded,
    componentName,
    'small',
    translationsValues,
  );
  const tinyTooltipText = parseElementText(
    cookiesNeeded,
    componentName,
    'tiny',
    translationsValues,
  );
  const smallTooltipText = parseTooltipText(
    componentName,
    'small',
    cookiesNeeded,
    translationsValues,
  );
  const tinyAriaLabelText = parseAriaLabelText(
    componentName,
    'tiny',
    translationsValues,
  );
  const smallAriaLabelText = parseAriaLabelText(
    componentName,
    'small',
    translationsValues,
  );

  return {
    largeText,
    mediumText,
    smallText,
    tinyTooltipText,
    smallTooltipText,
    tinyAriaLabelText,
    smallAriaLabelText,
  };
};

export const cancelBrowserScroll: React.KeyboardEventHandler = e => {
  if (e.key === ' ') {
    e.preventDefault();
  }
};

export const getComponentProps = <T extends object>(
  isConsentPolicyActive: boolean,
  props: T,
): any => {
  return isConsentPolicyActive ? {} : props;
};

export const consentPolicyUiTypeMapper = withCompInfo<any, any>()(
  ['experiments', 'isConsentPolicyActive'],
  ({ experiments, isConsentPolicyActive }) => {
    return experiments[shouldExportCurrentConsentPolicyExperiment] &&
      isConsentPolicyActive
      ? 'WithConsentWrapper'
      : undefined;
  },
);

export const shouldShowConsentPolicyWrapper = (uiType: string | undefined) => {
  return uiType === 'WithConsentWrapper';
};

export const getConsentPolicyStateRefs = (): any => [
  'currentConsentPolicy',
  'openSettingModal',
];

export const isMobile = (deviceType: DeviceType) => {
  return deviceType !== 'Desktop';
};

export const mapConsentPolicyStateRefValues = (
  stateValues: CookieConsentRefValues,
): ConsentPolicyControllerProps => {
  return {
    consentPolicy: stateValues.currentConsentPolicy,
    openSettingModal: stateValues.openSettingModal,
  };
};

export const translateConsentWrapperKeys = (
  componentNameKey: string,
  componentNameDefault: string,
  translate: (namespace: string, key: string) => string | undefined,
): ConsentPolicyWrapperTranslationsValues => {
  const componentName =
    translate(CONSENT_POLICY_NAMESPACE, componentNameKey) ||
    componentNameDefault;

  const translationObj: ConsentPolicyWrapperTranslationsValues = {
    componentName,
  } as ConsentPolicyWrapperTranslationsValues;

  return translationKeys
    .filter(key => key !== 'componentName')
    .reduce(
      (
        accumulator: ConsentPolicyWrapperTranslationsValues,
        translation: ConsentPolicyWrapperTranslationsKeys,
      ) => {
        const translationKey =
          translationKeysMap[
            `${translation}_key` as keyof typeof translationKeysMap
          ];
        const translationDefault =
          translationKeysMap[
            `${translation}_default` as keyof typeof translationKeysMap
          ];
        accumulator[translation] =
          translate!(CONSENT_POLICY_NAMESPACE, translationKey) ||
          translationDefault;
        return accumulator;
      },
      translationObj,
    );
};

type Props = Record<string, any>;

export const withConsentWrapperProps = <
  TCompProps extends Props,
  TDefinition extends AnyCompDef,
  TCarmiData = undefined,
>(
  componentNameKey: string,
  componentNameDefault: string,
  mapper: ReturnType<
    ReturnType<typeof withCompInfo<TCompProps, TDefinition, TCarmiData>>
  >,
) => {
  const depsKeys = ['uiType', 'deviceType', 'translate'];
  const deps: Record<keyof CompInfo<TDefinition>, true> = depsKeys.reduce(
    (acc, key) => ({ ...acc, [key]: true }),
    mapper.deps,
  );

  const resolver = (
    data: any,
    carmiData: any,
  ): ReturnType<typeof mapper.resolver> & ConsentPolicyMapperProps => {
    const { uiType, deviceType, translate } = data;
    const { translations: mapperTranslationsProps, ...mapperProps } =
      mapper.resolver(data, carmiData);

    return {
      ...carmiData,
      ...mapperProps,
      isConsentPolicyActive: shouldShowConsentPolicyWrapper(uiType),
      isMobile: isMobile(deviceType),
      translations: {
        ...mapperTranslationsProps,
        ...translateConsentWrapperKeys(
          componentNameKey,
          componentNameDefault,
          translate,
        ),
      },
    };
  };

  return {
    deps,
    resolver,
  };
};
