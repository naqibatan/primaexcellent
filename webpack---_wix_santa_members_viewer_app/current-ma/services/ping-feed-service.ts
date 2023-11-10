import {
  IHttpClient,
  IPlatformServices,
  ViewerScriptFlowAPI,
} from '@wix/yoshi-flow-editor';
import { getNumberOfUnseenNotifications } from '@wix/ambassador-ping-feed-v1-notification/http';
import {
  FeedChannel,
  SpecialMigrationSpecs,
} from '@wix/ambassador-ping-feed-v1-notification/types';
import { ActivityCounter } from '@wix/ambassador-members-v1-activity-counter/types';

import { NOTIFICATIONS_APP_ID } from '../../constants';

interface Request {
  httpClient: IHttpClient;
  biService: IPlatformServices['bi'];
  flowAPI: ViewerScriptFlowAPI;
  memberId: string;
}

export async function getNumberOfUnseenNotificationsActivityCounter({
  httpClient,
  biService,
  flowAPI,
  memberId,
}: Request): Promise<ActivityCounter | null> {
  try {
    const response = await httpClient.request(
      getNumberOfUnseenNotifications({
        shouldCancelMergeContactInMobile: false,
        recipient: {
          contact: {
            metaSiteId: biService?.bi?.metaSiteId,
            contactId: memberId,
          },
        },
        feedFilter: {
          channel: FeedChannel.WEB,
        },
        specialMigrationSpecs: [SpecialMigrationSpecs.HideChatNotifications],
      }),
    );

    const numberOfUnseen = response?.data?.numberOfUnseen;

    if (!numberOfUnseen) {
      return null;
    }

    return {
      memberId,
      appId: NOTIFICATIONS_APP_ID,
      counters: [
        { key: 'notificationsCount', public: false, count: numberOfUnseen },
      ],
    };
  } catch (error) {
    flowAPI.errorMonitor?.captureException(error as Error);
    return null;
  }
}
