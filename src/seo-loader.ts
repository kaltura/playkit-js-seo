// @ts-ignore
const { RequestBuilder } = KalturaPlayer.providers;

// @ts-ignore
class SeoLoader implements KalturaPlayerTypes.ILoader {
  private entryId: string;
  public readonly requests: any[];

  private _seoProperties = '';

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
