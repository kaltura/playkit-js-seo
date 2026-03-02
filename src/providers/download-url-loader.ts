import { ILoader } from '@playkit-js/playkit-js-providers/types';
import { RequestBuilder } from '@playkit-js/playkit-js-providers/ovp-provider';
import { KalturaAttachmentAsset } from './response-types';
import { buildRequests } from './utils/request-builder-helper';

export class DownloadUrlLoader implements ILoader {
  private _attachments: Array<KalturaAttachmentAsset>;
  private _requests: RequestBuilder[] = [];
  private _response: { urls: Map<string, string> } = {
    urls: new Map()
  };

  public static get id(): string {
    return 'getUrls';
  }

  constructor({ attachments }: { attachments: Array<KalturaAttachmentAsset> }) {
    this._attachments = attachments;
    this._requests = buildRequests(attachments, 'attachment_attachmentAsset', 'getUrl', 'id');
  }

  public set requests(requests: any[]) {
    this._requests = requests;
  }

  public get requests(): any[] {
    return this._requests;
  }

  public set response(response: any) {
    const urls: Map<string, string> = new Map();
    for (let index = 0; index < this._requests.length; index++) {
      urls.set(this._requests[index].params.id, response[index]?.data);
    }
    this._response.urls = urls;
  }

  public get response(): any {
    return this._response;
  }

  public isValid(): boolean {
    return true;
  }
}
