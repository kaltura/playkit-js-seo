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
  captions: KalturaCaptionAsset[];
  attachments: KalturaAttachmentAsset[];
}

export class SeoAssetsService {
  constructor(private player: KalturaPlayer, private logger: any, private config: any) {}

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

  private selectTenLanguages(captions: Map<string, KalturaCaptionAsset[]>): Map<string, KalturaCaptionAsset[]> {
    const selectedLanguages: Array<[string, KalturaCaptionAsset[]]> = [];
    let foundUsageOne = false;

    for (const [language, languageCaptions] of captions) {
      const hasUsageOne = languageCaptions.some(c => Number(c.usage) === 1);

      if (selectedLanguages.length < 10) {
        selectedLanguages.push([language, languageCaptions]);
        if (hasUsageOne) {
          foundUsageOne = true;
        }
      } else {
        if (!foundUsageOne && hasUsageOne) {
          selectedLanguages[9] = [language, languageCaptions];
          break;
        }
        if (foundUsageOne) {
          break;
        }
      }
    }
    return new Map(selectedLanguages);
  }
  
  private selectCaptions(captions: KalturaCaptionAsset[]): KalturaCaptionAsset[] {
    let captionsByLanguage = this.groupCaptionsByLanguage(captions);
    if (!this.config.addAllCaptions) {
      captionsByLanguage = this.selectTenLanguages(captionsByLanguage);
    }
    const selectedCaptions: KalturaCaptionAsset[] = [];
    for (const [, languageCaptions] of captionsByLanguage) {
      const bestCaptionsForLanguage = this.mostAccuratePerUsage(languageCaptions);
      selectedCaptions.push(...bestCaptionsForLanguage);
    }
    return selectedCaptions;
  }

  private groupCaptionsByLanguage(captions: KalturaCaptionAsset[]): Map<string, KalturaCaptionAsset[]> {
    const captionsByLanguage = new Map<string, KalturaCaptionAsset[]>();
    for (const caption of captions) {
      if (!captionsByLanguage.has(caption.language)) {
        captionsByLanguage.set(caption.language, []);
      }
      captionsByLanguage.get(caption.language)!.push(caption);
    }
    return captionsByLanguage;
  }

  private mostAccuratePerUsage(captions: KalturaCaptionAsset[]): KalturaCaptionAsset[] {
    const byUsage = new Map<number, KalturaCaptionAsset>();
    for (const caption of captions) {
      const usage = Number(caption.usage);
      const existingCaption = byUsage.get(usage);
      if (!existingCaption || caption.accuracy > existingCaption.accuracy) {
        byUsage.set(usage, caption);
      }
    }
    return Array.from(byUsage.values());
  }


  private async loadCaptionData(captions: KalturaCaptionAsset[], ks: string): Promise<void> {
    const selectedCaptions = this.selectCaptions(captions);

    for (const caption of selectedCaptions) {
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
      if (urlsData?.has(DownloadUrlLoader.id)) {
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
