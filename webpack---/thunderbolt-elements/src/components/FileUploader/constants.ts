import { keyCodes } from '@wix/editor-elements-common-utils';

export const allowedKeyCodes: Array<number> = [keyCodes.enter, keyCodes.space];

export const testIds = {
  uploadButton: 'upload-button',
  buttonLabel: 'button-label',
  fileList: 'file-list',
  fileWithIcon: 'file-with-icon',
  xIcon: 'x-icon',
  fileName: 'file-name',
  tooltipContainer: 'tooltip-container',
  tooltipTrigger: 'tooltip-trigger',
  errorTooltip: 'error-tooltip',
  errorTooltipText: 'error-tooltip-text',
  numberOfFilesLink: 'number-of-files-link',
  filesPopper: 'files-popper',
  centerEllipsisStart: 'center-elipsis-start',
  centerEllipsis: 'center-ellipsis',
  mobileSeperator: 'mobile-seperator',
  mobileCloseButton: 'mobile-close-button',
  closedPopperStatusIndicator: 'closed-popper-status-indicator',
  textBelowButton: 'text-below-button',
  poppersWrapper: 'poppers-wrapper',
  popperFilesWrapper: 'popper-files-wrapper',
  successIndication: 'success-indication',
  deleteFileDescSrOnly: 'delete-file-desc-sr-only',
  liveRegion: 'live-region',
};

export const translationsNamespace = 'upload_button';

export const TRANSLATION_KEYS = {
  'FileUploader.NumberOfSelectedFiles': 'FileUploader.NumberOfSelectedFiles',
  'FileUploader.SingleSelectedFile': 'FileUploader.SingleSelectedFile',
  Upload_Button_Filename_Preview_Text_Filename:
    'Upload_Button_Filename_Preview_Text_Filename',
  FileUploader_Mobile_ClosePopper: 'mobile_popper.close',
  'FileUploader.MultipleErrors':
    'upload_button.validation_error.multiple_file_errors',
  'FileUploader.SingleError':
    'upload_button.validation_error.single_file_error',
  'FileUploader.ExceededFilesLimit':
    'upload_button.validation_error.exceeded_files_limit',
} as const;

export const NumberOfFilesTranslationPlaceholder = '{numberOfFiles}';
export const NumberOfErrorsTranslationPlaceholder = '{errorAmount}';

export const TRANSLATION_FALLBACKS = {
  [TRANSLATION_KEYS[
    'FileUploader.NumberOfSelectedFiles'
  ]]: `${NumberOfFilesTranslationPlaceholder} files selected.`,
  [TRANSLATION_KEYS.Upload_Button_Filename_Preview_Text_Filename]:
    'Example.txt',
  [TRANSLATION_KEYS['FileUploader.SingleSelectedFile']]: '1 file selected.',
  [TRANSLATION_KEYS.FileUploader_Mobile_ClosePopper]: 'Close',
  [TRANSLATION_KEYS['FileUploader.SingleError']]: '1 error found.',
  [TRANSLATION_KEYS[
    'FileUploader.MultipleErrors'
  ]]: `${NumberOfErrorsTranslationPlaceholder} errors found.`,
  [TRANSLATION_KEYS[
    'FileUploader.ExceededFilesLimit'
  ]]: `Please select up to ${NumberOfFilesTranslationPlaceholder} files.`,
};

export const GeneralErrorTranslation = {
  key: 'Upload_Button_File_Upload_General_Error',
  fallback: 'File failed to upload',
};

export const POPPERS_WRAPPER_ID = 'poppers-wrapper';

export const MediaServerErrorKeysTranslationMapping = {
  'wpm_error.authentication_failed': 'wpm_error.authentication_failed',
  'wpm_error.invalid_file': 'wpm_error.invalid_file',
  'wpm_error.file_size_exceeded_limit': 'wpm_error.file_size_exceeded_limit',
  'wpm_error.mime_type_mismatch': 'wpm_error.mime_type_mismatch',
  'wpm_error.site_quota_free_video_duration_exceeded':
    'wpm_error.site_quota_free_video_duration_exceeded',
  'wpm_error.unsupported_format': 'wpm_error.unsupported_format',
  'wpm_error.unsupported_file_extension':
    'wpm_error.unsupported_file_extension',
  'wpm_error.incorrect_file_info': 'wpm_error.incorrect_file_info',
  'wpm_error.site_quota_total_storage_exceeded':
    'wpm_error.site_quota_total_storage_exceeded',
  'wpm_error.zero_size_file': 'wpm_error.zero_size_file',
  'wpm_error.site_quota_total_video_duration_exceeded':
    'wpm_error.site_quota_total_video_duration_exceeded',
  'wpm_error.invalid_file_video_stream_is_missing':
    'wpm_error.invalid_file_video_stream_is_missing',
  'wpm_error.invalid_file_video_bitrate_is_missing':
    'wpm_error.invalid_file_video_bitrate_is_missing',
  'wpm_error.invalid_file_video_duration_is_missing':
    'wpm_error.invalid_file_video_duration_is_missing',
  'wpm_error.invalid_file_audio_bitrate_is_missing':
    'wpm_error.invalid_file_audio_bitrate_is_missing',
  'wpm_error.invalid_file_audio_duration_is_missing':
    'wpm_error.invalid_file_audio_duration_is_missing',
} as const;

export const openFilesPopperKeyCodes: Array<number> = [
  keyCodes.enter,
  keyCodes.space,
];

export const closeFilesPopperKeyCodes: Array<number> = [
  keyCodes.escape,
  keyCodes.tab,
];

export const keyCodesToExcludeFromPreventDefault: Array<number> = [
  keyCodes.tab,
];

export const MIN_LABEL_FONT_SIZE = 16;
