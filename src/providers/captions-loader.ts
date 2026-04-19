import { KalturaCaptionAssetListResponse, KalturaCaptionAsset } from './response-types';
import { ILoader } from '@playkit-js/playkit-js-providers/types';
import { RequestBuilder } from '@playkit-js/playkit-js-providers/ovp-provider';

interface CaptionsLoaderParams {
  entryId: string;
}

interface CaptionsResponse {
  captions: Array<KalturaCaptionAsset>;
}

export class CaptionsLoader implements ILoader {
  private _entryId: string;
  private _requests: RequestBuilder[] = [];
  private _response: CaptionsResponse = {
    captions: []
  };

  public static get id(): string {
    return 'captions';
  }

  constructor({ entryId }: CaptionsLoaderParams) {
    this._entryId = entryId;

    const headers: Map<string, string> = new Map();

    const captionsListRequest = new RequestBuilder(headers);
    captionsListRequest.service = 'caption_captionAsset';
    captionsListRequest.action = 'list';
    captionsListRequest.params = {
      filter: {
        entryIdEqual: this._entryId,
        objectType: 'KalturaCaptionAssetFilter'
      },
      pager: {
        pageSize: 500,
        objectType: 'KalturaFilterPager'
      }
    };
    this.requests.push(captionsListRequest);
  }

  public set requests(requests: any[]) {
    this._requests = requests;
  }

  public get requests(): any[] {
    return this._requests;
  }

  public set response(response: any) {
    const captionAssetListRequestResponse = new KalturaCaptionAssetListResponse(response[0]?.data);
    if (captionAssetListRequestResponse.totalCount) {
      this._response.captions = captionAssetListRequestResponse?.data;
    }
  }

  public get response(): any {
    return this._response;
  }

  public isValid(): boolean {
    return Boolean(this._entryId);
  }
}
