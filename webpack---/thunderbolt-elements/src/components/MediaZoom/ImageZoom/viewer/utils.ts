import { ImageZoomImages, IGetDimensionsData } from '../ImageZoom.types';

const DIALOG_BOX_MIN_WIDTH = 600;
const DEFAULT_PANEL_HEIGHT_DESKTOP = 20;

export const DESKTOP_VIEW_DEFAULTS = {
  marginTop: 0,
  marginLeft: 0,
  dialogBoxHeight: 600,
  dialogBoxWidth: DIALOG_BOX_MIN_WIDTH,
  imageContainerWidth: 500,
  imageContainerHeight: 500,
};

const DIALOG_BOX_PADDING_DESKTOP = {
  horizontal: 0,
  vertical: 85,
};

const spacers = {
  width: 240,
  height: 60,
};

export const getSelectedImageIndex = (
  images: ImageZoomImages = [],
  dataItemId: string,
): number => {
  const selectedIndex = images.findIndex(({ id }) => id === dataItemId);
  return selectedIndex !== -1 ? selectedIndex : 0;
};

export const getDimensions = (
  data: Pick<
    IGetDimensionsData,
    'screenMeasures' | 'imageMeasures' | 'panelHeight'
  >,
) => {
  const { screenMeasures, imageMeasures, panelHeight: imageInfoBox } = data;
  const defaultPanelHeight = DEFAULT_PANEL_HEIGHT_DESKTOP;

  const dialogBoxPadding = DIALOG_BOX_PADDING_DESKTOP;

  const { width: screenWidth, height: screenHeight } = screenMeasures;
  const panelHeight = imageInfoBox || defaultPanelHeight;

  const horizontalOffsets = spacers.width;

  const verticalOffsets =
    spacers.height / 2 + panelHeight + dialogBoxPadding.vertical;

  const maxImageWidth = Math.min(
    imageMeasures.width,
    screenWidth - horizontalOffsets,
  );
  const maxImageHeight = Math.min(
    imageMeasures.height,
    screenHeight - verticalOffsets,
  );

  return getDimensionsForImageAndBox({
    imageMeasures,
    screenMeasures,
    maxImageWidth,
    maxImageHeight,
    panelHeight,
    minBoxWidth: DIALOG_BOX_MIN_WIDTH,
    dialogBoxPadding,
  });
};

const getImageContainerDimensions = ({
  imageMeasures,
  maxImageWidth,
  maxImageHeight,
  minBoxWidth,
}: IGetDimensionsData) => {
  const wScale = maxImageWidth / imageMeasures.width;
  const hScale = maxImageHeight / imageMeasures.height;
  const targetScale = Math.min(wScale, hScale);
  return {
    width: Math.max(Math.round(imageMeasures.width * targetScale), minBoxWidth),
    height: Math.round(imageMeasures.height * targetScale),
  };
};

export const getDimensionsForImageAndBox = ({
  panelHeight,
  screenMeasures,
  dialogBoxPadding,
  ...rest
}: Omit<IGetDimensionsData, 'panelData'>) => {
  const { height: screenHeight } = screenMeasures;

  const imageContainer = getImageContainerDimensions(
    rest as IGetDimensionsData,
  );

  const dialogBoxWidth =
    imageContainer.width + (dialogBoxPadding.horizontal || 0);

  const dialogBoxHeight =
    imageContainer.height + panelHeight + (dialogBoxPadding.vertical || 0);
  const distanceFromTop = Math.ceil(
    Math.max((screenHeight - dialogBoxHeight) / 2, 0),
  );

  return {
    marginLeft: dialogBoxPadding.horizontal / 2,
    marginTop: distanceFromTop,
    dialogBoxHeight,
    dialogBoxWidth,
    imageContainerWidth: imageContainer.width,
    imageContainerHeight: imageContainer.height,
  };
};
