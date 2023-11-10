export var FieldNameType;
(function (FieldNameType) {
  FieldNameType["ROLE"] = "ROLE";
  FieldNameType["PRESET"] = "PRESET";
})(FieldNameType || (FieldNameType = {}));
export var MessageType;
(function (MessageType) {
  MessageType["SUCCESS"] = "SUCCESS";
  MessageType["DOWNLOAD"] = "DOWNLOAD";
  MessageType["REGISTRATION"] = "REGISTRATION";
  MessageType["MULTI_STEP_SUCCESS"] = "MULTI_STEP_SUCCESS";
})(MessageType || (MessageType = {}));
export var FIELD_COMPONENT_TYPES;
(function (FIELD_COMPONENT_TYPES) {
  FIELD_COMPONENT_TYPES["TEXT_INPUT"] =
    "wysiwyg.viewer.components.inputs.TextInput";
  FIELD_COMPONENT_TYPES["RADIO_GROUP"] =
    "wysiwyg.viewer.components.inputs.RadioGroup";
  FIELD_COMPONENT_TYPES["DATE_PICKER"] =
    "wysiwyg.viewer.components.inputs.DatePicker";
  FIELD_COMPONENT_TYPES["COMBOBOX"] =
    "wysiwyg.viewer.components.inputs.ComboBoxInput";
  FIELD_COMPONENT_TYPES["TEXT_AREA_INPUT"] =
    "wysiwyg.viewer.components.inputs.TextAreaInput";
  FIELD_COMPONENT_TYPES["FILE_UPLOADER"] =
    "wysiwyg.viewer.components.inputs.FileUploader";
  FIELD_COMPONENT_TYPES["CHECKBOX_GROUP"] =
    "wysiwyg.viewer.components.inputs.CheckboxGroup";
  FIELD_COMPONENT_TYPES["SINGLE_CHECKBOX"] =
    "wysiwyg.viewer.components.inputs.Checkbox";
  FIELD_COMPONENT_TYPES["RICH_TEXT"] = "wysiwyg.viewer.components.WRichText";
  FIELD_COMPONENT_TYPES["RATING"] = "wixui.RatingsInput";
  FIELD_COMPONENT_TYPES["RECAPTCHA"] = "wixui.Captcha";
  FIELD_COMPONENT_TYPES["SIGNATURE_INPUT"] = "wixui.SignatureInput";
  FIELD_COMPONENT_TYPES["TIME_PICKER"] = "wixui.TimePicker";
  FIELD_COMPONENT_TYPES["ADDRESS_INPUT"] = "wixui.AddressInput";
  FIELD_COMPONENT_TYPES["COMPLEX_FIELD_WIDGET"] =
    "platform.components.AppWidget";
})(FIELD_COMPONENT_TYPES || (FIELD_COMPONENT_TYPES = {}));
export var FormsFieldPreset;
(function (FormsFieldPreset) {
  FormsFieldPreset["FIRST_NAME"] = "firstName";
  FormsFieldPreset["LAST_NAME"] = "lastName";
  FormsFieldPreset["COMPANY"] = "company";
  FormsFieldPreset["POSITION"] = "position";
  FormsFieldPreset["EMAIL"] = "email";
  FormsFieldPreset["MAIN_EMAIL"] = "mainEmail";
  FormsFieldPreset["ADDRESS"] = "address";
  FormsFieldPreset["PHONE"] = "phone";
  FormsFieldPreset["BIRTHDAY"] = "birthday";
  FormsFieldPreset["ANNIVERSARY"] = "anniversary";
  FormsFieldPreset["WEBSITE"] = "website";
  FormsFieldPreset["AGREE_TERMS"] = "agreeTerms";
  FormsFieldPreset["GENERAL_TEXT"] = "generalText";
  FormsFieldPreset["GENERAL_NUMBER"] = "generalNumber";
  FormsFieldPreset["GENERAL_URL"] = "generalURL";
  FormsFieldPreset["GENERAL_RADIO_BUTTON"] = "generalRadioButton";
  FormsFieldPreset["GENERAL_DROP_DOWN"] = "generalDropDown";
  FormsFieldPreset["GENERAL_CHECKBOX"] = "generalCheckbox";
  FormsFieldPreset["GENERAL_SINGLE_CHECKBOX"] = "generalSingleCheckbox";
  FormsFieldPreset["GENERAL_SUBSCRIBE"] = "generalSubscribe";
  FormsFieldPreset["GENERAL_TEXT_BOX"] = "generalTextBox";
  FormsFieldPreset["GENERAL_UPLOAD_BUTTON"] = "generalUploadButton";
  FormsFieldPreset["GENERAL_DATE_PICKER"] = "generalDatePicker";
  FormsFieldPreset["GENERAL_RATING"] = "generalRating";
  FormsFieldPreset["GENERAL_RECAPTCHA"] = "generalRecaptcha";
  FormsFieldPreset["GENERAL_SIGNATURE"] = "generalSignature";
  FormsFieldPreset["GENERAL_TIME_PICKER"] = "generalTimePicker";
  FormsFieldPreset["GENERAL_ITEMS_LIST"] = "generalItemsList";
  FormsFieldPreset["GENERAL_CUSTOM_AMOUNT"] = "generalCustomAmount";
  FormsFieldPreset["GENERAL_AUTOCOMPLETE_ADDRESS"] =
    "generalAutoCompleteAddress";
  FormsFieldPreset["CRM_TEXT"] = "crmText";
  FormsFieldPreset["CRM_NUMBER"] = "crmNumber";
  FormsFieldPreset["CRM_URL"] = "crmURL";
  FormsFieldPreset["CRM_DATE"] = "crmDate";
  FormsFieldPreset["COMPLEX_PHONE_WIDGET"] = "complexPhoneWidget";
  FormsFieldPreset["COMPLEX_PHONE_DROPDOWN"] = "complexPhoneDropdown";
  FormsFieldPreset["COMPLEX_PHONE_TEXT"] = "complexPhoneText";
  FormsFieldPreset["COMPLEX_ADDRESS_WIDGET"] = "complexAddressWidget";
  FormsFieldPreset["COMPLEX_ADDRESS_STREET"] = "complexAddressStreet";
  FormsFieldPreset["COMPLEX_ADDRESS_STREET_2"] = "complexAddressStreet2";
  FormsFieldPreset["COMPLEX_ADDRESS_CITY"] = "complexAddressCity";
  FormsFieldPreset["COMPLEX_ADDRESS_STATE"] = "complexAddressState";
  FormsFieldPreset["COMPLEX_ADDRESS_ZIPCODE"] = "complexAddressZipcode";
  FormsFieldPreset["COMPLEX_ADDRESS_COUNTRY"] = "complexAddressCountry";
  FormsFieldPreset["NONE"] = "";
})(FormsFieldPreset || (FormsFieldPreset = {}));
export var AdiFieldPreset;
(function (AdiFieldPreset) {
  AdiFieldPreset["ADI_EMAIL"] = "adiEmail";
  AdiFieldPreset["ADI_ADDRESS"] = "adiAddress";
  AdiFieldPreset["ADI_PHONE"] = "adiPhone";
  AdiFieldPreset["ADI_URL"] = "adiURL";
  AdiFieldPreset["ADI_DATE"] = "adiDate";
  AdiFieldPreset["ADI_NUMBER"] = "adiNumber";
  AdiFieldPreset["ADI_FIRST_NAME"] = "adiFirstName";
  AdiFieldPreset["ADI_LAST_NAME"] = "adiLastName";
  AdiFieldPreset["ADI_GENERAL_TEXT"] = "adiGeneralText";
  AdiFieldPreset["ADI_GENERAL_TEXT_BOX"] = "adiGeneralTextBox";
  AdiFieldPreset["ADI_UPLOAD_BUTTON"] = "adiGeneralUploadButton";
  AdiFieldPreset["ADI_GENERAL_DROPDOWN"] = "adiGeneralDropDown";
})(AdiFieldPreset || (AdiFieldPreset = {}));
export var RegistrationFieldPreset;
(function (RegistrationFieldPreset) {
  RegistrationFieldPreset["REGISTRATION_FORM_LINK_TO_LOGIN"] =
    "regForm_linkToLoginDialog";
  RegistrationFieldPreset["REGISTRATION_FORM_PRIVACY_POLICY"] =
    "regForm_privacyPolicy";
  RegistrationFieldPreset["REGISTRATION_FORM_CODE_OF_CONDUCT"] =
    "regForm_codeOfConduct";
  RegistrationFieldPreset["REGISTRATION_FORM_LOGIN_EMAIL"] =
    "regForm_loginEmail";
  RegistrationFieldPreset["REGISTRATION_FORM_PASSWORD"] = "regForm_password";
  RegistrationFieldPreset["REGISTRATION_FORM_CHECKBOX_AGREE_TERMS"] =
    "regForm_checkboxAgreeTerms";
  RegistrationFieldPreset["REGISTRATION_FORM_CHECKBOX_JOIN_COMMUNITY"] =
    "regForm_checkboxJoinCommunity";
})(RegistrationFieldPreset || (RegistrationFieldPreset = {}));
export var CustomTypes;
(function (CustomTypes) {
  CustomTypes["TEXT"] = "Text";
  CustomTypes["NUMBER"] = "Number";
  CustomTypes["URL"] = "URL";
  CustomTypes["DATE"] = "Date";
})(CustomTypes || (CustomTypes = {}));
export var OptionType;
(function (OptionType) {
  OptionType["SELECT_OPTION"] = "SelectOption";
  OptionType["RADIO_BUTTON"] = "RadioButton";
  OptionType["CHECKBOX_GROUP"] = "CheckboxInput";
})(OptionType || (OptionType = {}));
export var FieldRenderConfigType;
(function (FieldRenderConfigType) {
  FieldRenderConfigType["REMOVE"] = "REMOVE";
  FieldRenderConfigType["DISABLED"] = "DISABLED";
  FieldRenderConfigType["ENABLED"] = "ENABLED";
})(FieldRenderConfigType || (FieldRenderConfigType = {}));
//# sourceMappingURL=field-types.js.map
