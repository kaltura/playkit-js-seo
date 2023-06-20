import { BasePlugin } from '@playkit-js/kaltura-player-js';

export const pluginName = 'seo';

export class Seo extends BasePlugin<Record<string, unknown>> {
  protected static defaultConfig: Record<string, unknown>;

  public static isValid(): boolean {
    return true;
  }

  protected loadMedia(): void {
    this.todo();
  }

  private todo(): void {
    // eslint-disable-next-line no-console
    console.log('`HI this is SEO...');
  }
}
