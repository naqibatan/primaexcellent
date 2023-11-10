import { IHttpClient } from '@wix/yoshi-flow-editor';
import { getRoles } from '@wix/ambassador-members-v1-role/http';
import { RolesService as IRolesService } from '../../../../types';

export class RolesService implements IRolesService {
  constructor(private httpClient: IHttpClient) {}
  async getMemberRoles(memberId: string) {
    const { data } = await this.httpClient.request(getRoles({ memberId }));

    return data.roles?.map((role) => role.roleKey?.toLocaleLowerCase()!) || [];
  }
}
