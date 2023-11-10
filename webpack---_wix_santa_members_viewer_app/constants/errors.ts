export enum PublicApiError {
  MissingMemberId = 'Error: please provide site member ID',
  RouteNotFound = 'Error: route not found by provided widgetId:',
  MissingMembersAreaPage = 'Error: missing members area page - failed to find prefix',
  CannotNavigateToMemberNoPublicPage = 'Error: cannot navigate to member, no public page',
  ControllerConfigNotInitialized = 'Error: Members area viewer controller config was not initialized',
  CannotFindPageToNavigateTo = 'Error: cannot find page to navigate to by provided widgetId and appDefinitionId. Check if correct widgetId or appDefId is passed.',
}
