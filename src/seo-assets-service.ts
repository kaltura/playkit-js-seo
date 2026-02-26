import { KalturaPlayer } from '@playkit-js/kaltura-player-js';
import { Utils } from '@playkit-js/playkit-js';
import {
  AttachmentsLoader,
  CaptionsLoader,
  DownloadUrlLoader,
  KalturaAttachmentAsset,
  KalturaCaptionAsset,
  ServeAssetlLoader
} from './providers';

interface KalturaAssets {
  captions: any;
  attachments: KalturaAttachmentAsset[];
}

export class SeoAssetsService {
  constructor(private player: KalturaPlayer, private logger: any) {}

  public async getAssets(entryId: string): Promise<KalturaAssets> {
    const ks = this.player.config.session?.ks || '';
    const data: Map<string, any> = await (this.player as any).provider.doRequest(
      [
        { loader: CaptionsLoader, params: { entryId } },
        { loader: AttachmentsLoader, params: { entryId } }
      ],
      ks
    );
    return this.parseDataFromResponse(data, ks);
  }

  private async parseDataFromResponse(data: Map<string, any>, ks: string): Promise<KalturaAssets> {
    const kalturaAssets: KalturaAssets = {
      captions: [],
      attachments: []
    };
    if (data) {
      if (data.has(CaptionsLoader.id)) {
        const captionsLoader = data.get(CaptionsLoader.id);
        kalturaAssets.captions = captionsLoader?.response?.captions || [];
      }
      if (data.has(AttachmentsLoader.id)) {
        const attachmentsLoader = data.get(AttachmentsLoader.id);
        kalturaAssets.attachments = attachmentsLoader?.response?.attachments || [];
      }
    }
    await this.loadCaptionData(kalturaAssets.captions, ks);
    await this.loadAttachmentData(kalturaAssets.attachments, ks);
    return kalturaAssets;
  }

  private async loadCaptionData(captions: KalturaCaptionAsset[], ks: string): Promise<void> {
    for (const caption of captions) {
      try {
        const contentData: Map<string, any> = await (this.player as any).provider.doRequest(
          [{ loader: ServeAssetlLoader, params: { captions: [caption] } }],
          ks
        );
        if (contentData && contentData.has(ServeAssetlLoader.id)) {
          const contentLoader = contentData.get(ServeAssetlLoader.id);
          const contents = contentLoader?.response?.serveResult;
          caption.content = contents?.get(caption.id) || '';
        }
      } catch (error) {
        this.logger.warn(`Failed to get content for caption ${caption.id}:`, error);
      }
    }
  }

  private async loadAttachmentData(attachments: KalturaAttachmentAsset[], ks: string): Promise<void> {
    if (attachments.length > 0) {
      const urlsData: Map<string, any> = await (this.player as any).provider.doRequest(
        [{ loader: DownloadUrlLoader, params: { attachments } }],
        ks
      );
      if (urlsData && urlsData.has(DownloadUrlLoader.id)) {
        const urlsLoader = urlsData.get(DownloadUrlLoader.id);
        const downloadUrls: Map<string, string> = urlsLoader?.response?.urls;
        attachments.forEach((attachment: KalturaAttachmentAsset) => {
          attachment.downloadUrl = downloadUrls?.get(attachment.id!) || '';
        });
      }
    }
  }

  public async downloadByUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      Utils.Http.execute(url, {}, 'GET')
        .then((response: string) => {
          resolve(response);
        })
        .catch((error: any) => {
          this.logger.error(`Failed to download from ${url}:`, error);
          reject(error);
        });
    });
  }
}
