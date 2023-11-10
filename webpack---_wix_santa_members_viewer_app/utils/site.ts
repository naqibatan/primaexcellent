import { IWixAPI } from '@wix/yoshi-flow-editor';
import { MEMBERS_AREA_V2 } from '@wix/app-definition-ids';

export const isProfilePageBoBInstalled = async (wixCodeApi: IWixAPI | null) => {
  return !!(await wixCodeApi?.site.isAppSectionInstalled({
    sectionId: 'member_page',
    appDefinitionId: MEMBERS_AREA_V2,
  }));
};
