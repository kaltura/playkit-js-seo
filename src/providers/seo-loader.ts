import { ILoader } from '@playkit-js/playkit-js-providers/types';
import { RequestBuilder } from '@playkit-js/playkit-js-providers/ovp-provider';

class SeoLoader implements ILoader {
  private entryId: string;
  private _seoProperties = '';
  public readonly requests: any[];

  public static get id(): string {
    return 'seo';
  }

  constructor({ entryId }: { entryId: string }) {
    this.entryId = entryId;

    const baseEntryGetRequest = new RequestBuilder();
    baseEntryGetRequest.service = 'baseEntry';
    baseEntryGetRequest.action = 'get';
    baseEntryGetRequest.params = {
      language: 'multi',
      entryId: this.entryId
    };

    this.requests = [baseEntryGetRequest];
  }

  public set response([baseEntryGetResponse]: [any, any]) {
    this._seoProperties = baseEntryGetResponse?.data;
  }

  public get seoProperties(): string {
    return this._seoProperties;
  }

  public isValid(): boolean {
    return true;
  }
}

export { SeoLoader };
