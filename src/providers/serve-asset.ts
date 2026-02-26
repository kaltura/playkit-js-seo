import { ILoader } from '@playkit-js/playkit-js-providers/types';
import { RequestBuilder } from '@playkit-js/playkit-js-providers/ovp-provider';
import { KalturaCaptionAsset } from './response-types';

interface ServeAssetlLoaderLoaderParams {
  captions: Array<KalturaCaptionAsset>;
}

interface ServeAssetlLoaderResponse {
  serveResult: Map<string, string>;
}

export class ServeAssetlLoader implements ILoader {
  public _captions: Array<KalturaCaptionAsset>;
  public _requests: RequestBuilder[] = [];
  public _response: ServeAssetlLoaderResponse = {
    serveResult: new Map()
  };

  public static get id(): string {
    return 'serveAsset';
  }

  constructor({ captions }: ServeAssetlLoaderLoaderParams) {
    this._captions = captions;
    this.addRequest(captions, 'caption_captionAsset', 'serveAsJson');
  }

  private addRequest(items: any[], service: string, action: string): void {
    const headers: Map<string, string> = new Map();
    items.forEach((item: { id: string }) => {
      const itemServeRequest = new RequestBuilder(headers);
      itemServeRequest.service = service;
      itemServeRequest.action = action;
      itemServeRequest.params = { captionAssetId: item.id };
      this.requests.push(itemServeRequest);
    });
  }

  public set requests(requests: any[]) {
    this._requests = requests;
  }

  public get requests(): any[] {
    return this._requests;
  }

  public set response(response: any) {
    const contents: Map<string, string> = new Map();
    for (let index = 0; index < this._requests.length; index++) {
      const id = this._requests[index].params.captionAssetId;
      const content = response[0]?.data?.objects;
      contents.set(id, content);
    }
    this._response.serveResult = contents;
  }

  public get response(): any {
    return this._response;
  }

  public isValid(): boolean {
    return true;
  }
}
