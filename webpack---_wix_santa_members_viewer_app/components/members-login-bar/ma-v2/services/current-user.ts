import { IHttpClient } from '@wix/yoshi-flow-editor';
import { getMyMember } from '@wix/ambassador-members-v1-member/http';
import { Set } from '@wix/ambassador-members-v1-member/types';

import { CurrentUserService as ICurrentUserService } from '../../../../types';

export class CurrentUserService implements ICurrentUserService {
  constructor(private httpClient: IHttpClient) {}

  async getCurrentUser() {
    const { data } = await this.httpClient.request(
      getMyMember({ fieldSet: Set.FULL }),
    );

    return data.member ?? null;
  }
}
