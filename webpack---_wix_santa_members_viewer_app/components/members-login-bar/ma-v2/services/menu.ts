import { makeAutoObservable } from 'mobx';

import {
  I$WWrapper,
  MenuContext,
  MenuItem,
  MenuService as IMenuService,
  RouteConfiguration,
} from '../../../../types';
import { getLoginBarMenu } from '../util';
import { APP_WIDGET_LOGIN_MENU_ID } from '../../../../constants';

const SLUG_PLACEHOLDERS = ['{userName}', 'my'];
const SLUG_INDEX = 1;

const findRouteByMenuItem = (routes: RouteConfiguration[], item: MenuItem) =>
  routes.find((route) => item.link?.includes(route.path));

export const getIsTabAccessibleWithUserRoles = (
  currentUserRoles: string[],
  visibleForRoles: string[],
) => {
  if (!visibleForRoles.length) {
    return true;
  }

  return currentUserRoles.some((role) => visibleForRoles.includes(role));
};

const getInitialMenuItems = ($w: I$WWrapper) => getLoginBarMenu($w).menuItems;

export class MenuService implements IMenuService {
  menuItems: MenuItem[];
  private menuContext!: MenuContext;

  constructor(private readonly $w: I$WWrapper) {
    this.menuItems = getInitialMenuItems(this.$w);
    makeAutoObservable(this);
  }

  initializeMenuItems(menuContext: MenuContext) {
    this.menuContext = menuContext;

    if (this.menuContext.cacheService.hasLoginMenuItems()) {
      this.menuItems = this.menuContext.cacheService.getLoginMenuItems();
      this.bindMenuItems();
      return;
    }

    this.filterMenuItemsVisibleForRoles();
    this.fillMenuItemsWithSlugs();
    this.menuContext.cacheService.setLoginMenuItems(this.menuItems);
    this.bindMenuItems();
  }

  private bindMenuItems() {
    this.$w(APP_WIDGET_LOGIN_MENU_ID).menuItems = this.menuItems;
  }

  private filterMenuItemsVisibleForRoles() {
    const { routes } = this.menuContext;
    const { currentUserRoles } = this.menuContext;

    this.menuItems = this.menuItems.filter((item) => {
      const routeConfig = findRouteByMenuItem(routes, item);

      if (!routeConfig?.vfr?.length) {
        return true;
      }

      return getIsTabAccessibleWithUserRoles(currentUserRoles, routeConfig.vfr);
    });
  }

  private fillMenuItemsWithSlugs() {
    const { currentUser } = this.menuContext;
    const slugOrId = currentUser?.profile?.slug ?? currentUser?.id;

    if (!slugOrId) {
      return;
    }

    this.menuItems = this.menuItems.map((item) =>
      this.updateMenuItemWithMemberSlug(item, slugOrId),
    );
  }

  private updateMenuItemWithMemberSlug(item: MenuItem, slugOrId: string) {
    const slugPlaceholder = this.getSlugPlaceholderFromMenuItem(item);

    if (this.isValidSlugPlaceholder(slugPlaceholder)) {
      return this.replaceLinkInMenuItem(item, slugOrId);
    }

    return item;
  }

  private isValidSlugPlaceholder(slugPlaceholder: string): boolean {
    return SLUG_PLACEHOLDERS.includes(slugPlaceholder);
  }

  private replaceLinkInMenuItem(item: MenuItem, replacementSlug: string) {
    const memberPageRelativePathItems =
      this.getMemberPageRelativePathItemsFromMenuItem(item);

    if (!memberPageRelativePathItems.length) {
      return item;
    }

    const link = item.link.replace(
      memberPageRelativePathItems.join('/'),
      this.getMemberPageRelativePathWithMemberSlug(
        memberPageRelativePathItems,
        replacementSlug,
      ),
    );

    return { ...item, link };
  }

  private getMemberPageRelativePathWithMemberSlug(
    membersAreaPageRelativePathItems: string[],
    replacementSlug: string,
  ) {
    return membersAreaPageRelativePathItems
      .map((item, index) => (index === SLUG_INDEX ? replacementSlug : item))
      .join('/');
  }

  private getSlugPlaceholderFromMenuItem(item: MenuItem) {
    const membersAreaPageRelativePathItems =
      this.getMemberPageRelativePathItemsFromMenuItem(item);

    return membersAreaPageRelativePathItems[SLUG_INDEX] ?? '';
  }

  private getMemberPageRelativePathItemsFromMenuItem(item: MenuItem) {
    const { membersAreaPagePrefix } = this.menuContext;
    const indexOfMembersAreaPagePrefix = item.link.indexOf(
      membersAreaPagePrefix,
    );

    return item.link.slice(indexOfMembersAreaPagePrefix).split('/');
  }
}
