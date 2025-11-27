import { BasePlugin, KalturaPlayer } from '@playkit-js/kaltura-player-js';
import { convertDurationToISO8601, convertUnixTimestampToISO8601 } from './date-formaters';
import type { Clip, VideoObject, WithContext } from 'schema-dts';
import { Chapter, CuePoint, TimedMetadataEvent, UnisphereCuePoint, UnisphereDataEvent } from './types';

export const PLUGIN_NAME = 'seo';
const SEO_SCRIPT_ID = `${location.hostname}k-player-seo`;
enum CueSourceNames {
  None = 'none',
  TimedMetadata = 'timedMetadata',
  Unisphere = 'unisphere'
}

export class Seo extends BasePlugin<Record<string, never>> {
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
    this.eventManager.listen(this.player, 'UNISPHERE_CHAPTERS_ADDED', (e) => this.onUnisphereDataAdded(e));
    this.registerCuePointTypes();
  }

  private async handleSEO(): Promise<void> {
    if (this.hasStructuredDataRequiredProperties()) {
      const SEOStructuredData: WithContext<VideoObject> = this.getSEOStructuredData();
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

  private getSEOStructuredData(): WithContext<VideoObject> {
    // Handle both sources.metadata and entryMeta structures
    const metadata = this.player.sources?.metadata || {};
    const entryMeta = (this.player as any).config?.entryMeta || {};
    
    const name = metadata.name || entryMeta.name;
    const description = metadata.description || entryMeta.description;
    const thumbnailUrl = this.player.sources?.poster || entryMeta.thumbnailUrl;
    const duration = this.player.sources?.duration || entryMeta.duration;
    const uploadDate = metadata.createdAt || entryMeta.createdAt || entryMeta.uploadDate;
    const endDate = metadata.endDate || entryMeta.endDate;
    
    const VideoStructuredData: WithContext<VideoObject> = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name,
      description,
      thumbnailUrl,
      duration: convertDurationToISO8601(duration!),
      contentUrl: this.player.selectedSource?.url
    };

    // Add upload date if available
    if (uploadDate) {
      VideoStructuredData.uploadDate = convertUnixTimestampToISO8601(uploadDate);
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
      newURL = url.slice(0, fragmentIndex) + separator + newParamName + '=' + encodedParamValue + url.slice(fragmentIndex);
    } else {
      newURL = url + separator + newParamName + '=' + encodedParamValue;
    }
    return newURL;
  }

  private hasStructuredDataRequiredProperties(): boolean {
    // Handle both sources.metadata and entryMeta structures
    const metadata = this.player.sources?.metadata || {};
    const entryMeta = (this.player as any).config?.entryMeta || {};
    
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
    if (payload.chapters.length) {
      this.chaptersData = this.extractUnisphereChaptersData(payload.chapters);

      if (this.cuesSource === CueSourceNames.TimedMetadata) {
        this.updateStructureDataWithTimeData();
      } else {
        this.resolveTimedDataReadyPromise();
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
    return chapterData.map(({ startTime, description, title }, index) => {
      const endTime = chapterData[index + 1] ? chapterData[index + 1].startTime : this.player?.sources.duration;
      return {
        startTime: +startTime,
        endTime: +(endTime || 0),
        name: title,
        description
      };
    });
  }

  private static generateTranscriptFromCuePoints(cuePointsArray: CuePoint[]): string {
    return cuePointsArray.reduce((transcript, cuePoint) => transcript + ' ' + cuePoint.metadata.text, '').trim();
  }
}
