import { BasePlugin, KalturaPlayer } from '@playkit-js/kaltura-player-js';
import { convertDurationToISO8601, convertUnixTimestampToISO8601 } from './date-formaters';
import type { Clip, VideoObject, WithContext } from 'schema-dts';
import { Chapter, CuePoint, TimedMetadataEvent, UnisphereCuePoint, UnisphereDataEvent, EntryMeta } from './types';
import { PlayerEvent } from '../types/player-event';
import { SeoLoader } from './seo-loader';

export const PLUGIN_NAME = 'seo';
const SEO_SCRIPT_ID = `${location.hostname}k-player-seo`;
enum CueSourceNames {
  None = 'none',
  TimedMetadata = 'timedMetadata',
  Unisphere = 'unisphere'
}

export class Seo extends BasePlugin<Record<string, never>> {
  private summaryData?: string;
  private chaptersData?: Chapter[];
  private transcriptData?: string;
  private timedDataReadyPromise: Promise<void>;
  private resolveTimedDataReadyPromise!: () => void;
  // Used to determine where to take chapters data from
  // Unisphere chapters have precedence over cuepoint chapters
  private cuesSource: CueSourceNames = CueSourceNames.None;

  constructor(name: string, player: KalturaPlayer, config?: Record<string, never>) {
    super(name, player, config);
    this.eventManager.listenOnce(this.player, this.player.Event.Core.CHANGE_SOURCE_ENDED, async () => this.handleSEO());
    this.timedDataReadyPromise = new Promise((resolve) => {
      this.resolveTimedDataReadyPromise = resolve;
    });
  }

  protected loadMedia(): void {
    if (!this.cuePointManager) {
      this.logger.warn("kalturaCuepoints haven't registered");
      return;
    }
    this.eventManager.listen(this.player, this.player.Event.Core.TIMED_METADATA_ADDED, (e) => this.onTimedMetadataAdded(e));
    this.eventManager.listen(this.player, PlayerEvent.UNISPHERE_CHAPTERS_ADDED, (e) => this.onUnisphereDataAdded(e));
    this.registerCuePointTypes();
  }

  private async handleSEO(): Promise<void> {
    if (this.hasStructuredDataRequiredProperties()) {
      const SEOStructuredData: WithContext<VideoObject> = await this.getSEOStructuredData();
      if (Seo.isPlayerIframeEmbeded()) {
        Seo.sendSEOStructuredData(SEOStructuredData);
      } else if (this.isNotInjectedYet()) {
        this.injectStructureData(SEOStructuredData);
        await this.timedDataReadyPromise;
        this.updateStructureDataWithTimeData();
      }
    } else {
      this.logger.error('SEO Structured Data Required properties are missing');
    }
  }

  private isNotInjectedYet(): boolean {
    return !document.getElementById(SEO_SCRIPT_ID);
  }

  private async getSEOStructuredData(): Promise<WithContext<VideoObject>> {
    // Handle both sources.metadata and entryMeta structures
    const metadata = this.player.sources?.metadata || {};
    const entryMeta: EntryMeta = (this.player as KalturaPlayer & { config?: { entryMeta?: EntryMeta } }).config?.entryMeta || {};

    // getSeoProperties call for multilingual support
    const entryId = this.player.sources?.id || '';
    let response = {};
    if (entryId) {
      response = (await this.getSeoProperties(entryId)) || {};
    }
    const seoProps = response as { name?: string; description?: string; tags?: string };

    const name = seoProps.name || metadata.name || entryMeta.name;
    const description = seoProps.description || metadata.description || entryMeta.description;
    const tags = seoProps.tags || metadata.tags || entryMeta.tags;
    const thumbnailUrl = this.player.sources?.poster || entryMeta.thumbnailUrl;
    const duration = this.player.sources?.duration || entryMeta.duration;
    const uploadDate = metadata.createdAt || entryMeta.createdAt || entryMeta.uploadDate;
    const endDate = metadata.endDate || entryMeta.endDate;

    const VideoStructuredData: WithContext<VideoObject> = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name,
      description,
      keywords: tags,
      thumbnailUrl,
      duration: convertDurationToISO8601(duration!),
      contentUrl: this.player.selectedSource?.url
    };

    // Add upload date if available
    if (uploadDate) {
      const timestamp = typeof uploadDate === 'string' ? Date.parse(uploadDate) / 1000 : uploadDate;
      VideoStructuredData.uploadDate = convertUnixTimestampToISO8601(timestamp);
    }

    // Add expiration date if available
    if (endDate) {
      VideoStructuredData.expires = convertUnixTimestampToISO8601(endDate);
    }

    return VideoStructuredData;
  }

  private updateStructureDataWithTimeData(): void {
    const scriptTag = document.getElementById(SEO_SCRIPT_ID);
    if (scriptTag) {
      const data = JSON.parse(scriptTag.textContent!);

      if (this.summaryData) {
        data.abstract = this.summaryData;
      }

      if (this.chaptersData?.length) {
        data.hasPart = this.getClips();
      }
      data.transcript = this.transcriptData;

      scriptTag.textContent = JSON.stringify(data);
    }
  }

  private getClips(): Clip[] {
    return this.chaptersData!.map((chapter) => {
      return {
        '@type': 'Clip',
        name: chapter.name,
        startOffset: chapter.startTime,
        endOffset: chapter.endTime,
        url: Seo.concatenateStartTimeQueryParam(window.location.href, 'kalturaStartTime', chapter.startTime),
        ...(chapter.description && { description: chapter.description })
      };
    });
  }

  private static sendSEOStructuredData(SEOStructuredData: WithContext<VideoObject>): void {
    window.parent.postMessage({ type: 'SEOStructuredData', SEOStructuredData }, '*');
  }

  private static concatenateStartTimeQueryParam(url: string, newParamName: string, newParamValue: number): string {
    const encodedParamValue = encodeURIComponent(newParamValue);
    const separator = url.includes('?') ? '&' : '?';
    const fragmentIndex = url.indexOf('#');
    let newURL;
    if (fragmentIndex !== -1) {
      newURL = `${url.slice(0, fragmentIndex) + separator + newParamName}=${encodedParamValue}${url.slice(fragmentIndex)}`;
    } else {
      newURL = `${url + separator + newParamName}=${encodedParamValue}`;
    }
    return newURL;
  }

  private hasStructuredDataRequiredProperties(): boolean {
    // Handle both sources.metadata and entryMeta structures
    const metadata = this.player.sources?.metadata || {};
    const entryMeta: EntryMeta = (this.player as KalturaPlayer & { config?: { entryMeta?: EntryMeta } }).config?.entryMeta || {};

    const name = metadata.name || entryMeta.name;
    const thumbnailUrl = this.player.sources?.poster || entryMeta.thumbnailUrl;
    const uploadDate = metadata.createdAt || entryMeta.createdAt || entryMeta.uploadDate;

    this.logger.debug('SEO metadata validation:', { name, thumbnailUrl, uploadDate });
    return !!(name && thumbnailUrl);
  }

  private static isPlayerIframeEmbeded(): boolean {
    return window.self !== window.top;
  }

  public static isValid(): boolean {
    return true;
  }

  private injectStructureData(jsonLdData: WithContext<VideoObject>): void {
    const script = document.createElement('script');
    script.id = SEO_SCRIPT_ID;
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(jsonLdData);
    document.head.appendChild(script);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get cuePointManager(): any {
    return this.player.getService('kalturaCuepoints');
  }

  private registerCuePointTypes(): void {
    this.cuePointManager.registerTypes([this.cuePointManager.CuepointType.CHAPTER, this.cuePointManager.CuepointType.CAPTION]);
  }

  private onUnisphereDataAdded({ payload }: UnisphereDataEvent): void {
    if (payload.summary) {
      this.summaryData = payload.summary;
    }

    if (payload.chapters.length) {
      this.chaptersData = this.extractUnisphereChaptersData(payload.chapters);

      if (this.cuesSource === CueSourceNames.TimedMetadata) {
        this.updateStructureDataWithTimeData();
      } else {
        this.resolveTimedDataReadyPromise();
        // Update structure data immediately for Unisphere-only scenarios
        this.updateStructureDataWithTimeData();
      }

      this.cuesSource = CueSourceNames.Unisphere;
    }
  }

  private onTimedMetadataAdded({ payload }: TimedMetadataEvent): void {
    const { KalturaCuePointType, KalturaThumbCuePointSubType } = this.cuePointManager;
    const chapterData: CuePoint[] = [];
    const captionData: CuePoint[] = [];

    payload.cues.forEach((cue: CuePoint) => {
      const { metadata } = cue;
      if (metadata?.cuePointType === KalturaCuePointType.THUMB && metadata?.subType === KalturaThumbCuePointSubType.CHAPTER) {
        chapterData.push(cue);
      }
      if (metadata?.cuePointType === KalturaCuePointType.CAPTION) {
        captionData.push(cue);
      }
    });
    if (chapterData.length && this.cuesSource === CueSourceNames.None) {
      this.chaptersData = Seo.extractRelevantChaptersData(chapterData);
      this.cuesSource = CueSourceNames.TimedMetadata;
      // if no captions are expected - resolve the promise to allow SEO data update
      if (!captionData.length) {
        this.resolveTimedDataReadyPromise();
      }
    }
    if (captionData.length) {
      this.transcriptData = Seo.generateTranscriptFromCuePoints(captionData);
      if (this.cuesSource === CueSourceNames.Unisphere) {
        this.updateStructureDataWithTimeData();
      } else {
        this.resolveTimedDataReadyPromise();
        this.cuesSource = CueSourceNames.TimedMetadata;
      }
    }
  }

  private static extractRelevantChaptersData(chapterData: CuePoint[]): Chapter[] {
    return chapterData.map(({ startTime, endTime, metadata }) => ({
      startTime,
      endTime,
      name: metadata.title,
      description: metadata.description
    }));
  }

  private extractUnisphereChaptersData(chapterData: UnisphereCuePoint[]): Chapter[] {
    return chapterData.map(({ time, description, title }, index) => {
      const endTime = chapterData[index + 1] ? chapterData[index + 1].time : this.player?.sources.duration;
      return {
        startTime: Number((+time).toFixed(3)),
        endTime: Number((+(endTime || 0)).toFixed(3)),
        name: title,
        description
      };
    });
  }

  private static generateTranscriptFromCuePoints(cuePointsArray: CuePoint[]): string {
    return cuePointsArray.reduce((transcript, cuePoint) => `${transcript} ${cuePoint.metadata.text}`, '').trim();
  }

  private async getSeoProperties(entryId: string): Promise<object | void> {
    try {
      return await this.getBaseEntryProperties(entryId);
    } catch (error) {
      this.logger.warn('Failed to get SEO properties', error);
    }
  }

  private async getBaseEntryProperties(entryId: string): Promise<object> {
    try {
      const response = await (this.player as any).provider.doRequest([{ loader: SeoLoader, params: { entryId } }]);
      return response.get('seo').seoProperties;
    } catch (e) {
      this.logger.warn('failed to get base entry properties from server for entryId:', entryId);
      return {};
    }
  }
}
