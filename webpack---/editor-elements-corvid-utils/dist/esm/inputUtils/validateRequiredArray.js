import { addErrorToValidationDataAndKeepMessage } from "./validityUtils";
export const validateRequiredArray = (props, validationData) => {
  const isRequired = props.required || false;
  if (!isRequired || props.value.length) {
    return validationData;
  }
  return addErrorToValidationDataAndKeepMessage(validationData, "valueMissing");
};
//# sourceMappingURL=validateRequiredArray.js.map
