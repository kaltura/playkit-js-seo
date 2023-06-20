// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { BasePlugin } from '@playkit-js/kaltura-player-js';
import { convertUnixTimestampToISO8601, convertDurationToISO8601 } from './date-formaters';
import type { VideoObject, WithContext } from 'schema-dts';

export const pluginName = 'seo';

export class Seo extends BasePlugin<Record<string, unknown>> {
  protected static defaultConfig: Record<string, unknown>;

  public static isValid(): boolean {
    return true;
  }

  protected loadMedia(): void {
    if (this.hasStructuredDataRequiredProperties()) {
      const SEOStructuredData: WithContext<VideoObject> = this.getSEOStructuredData();
      Seo.sendSEOStructuredData(SEOStructuredData);
    } else {
      this.logger.debug('SEO Structured Data Required properties are missing');
    }
  }

  private getSEOStructuredData(): WithContext<VideoObject> {
    const VideoStructuredData: WithContext<VideoObject> = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: this.player.sources.metadata.name,
      description: this.player.sources.metadata.description,
      thumbnailUrl: this.player.sources.poster,
      uploadDate: convertUnixTimestampToISO8601(this.player.sources.metadata.createdAt),
      duration: convertDurationToISO8601(this.player.sources.duration!),
      contentUrl: this.player.selectedSource.url
    };
    return VideoStructuredData;
  }

  private static sendSEOStructuredData(SEOStructuredData: WithContext<VideoObject>): void {
    window.parent.postMessage({ type: 'SEOStructuredData', SEOStructuredData }, '*');
  }

  private hasStructuredDataRequiredProperties(): boolean {
    const name = this.player.sources.metadata.name;
    const thumbnailUrl = this.player.sources.poster;
    const createdAt = this.player.sources.metadata.createdAt;
    return name && thumbnailUrl && createdAt;
  }
}
