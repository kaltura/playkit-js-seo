import { BasePlugin, ui } from '@playkit-js/kaltura-player-js';
import { SEOConfig } from './types/seo-config';
import { h } from 'preact';
import { SomeComponent } from './ui/more-icon/some-component.component';

export const pluginName = 'seo';

export class Seo extends BasePlugin<SEOConfig> {
  protected static defaultConfig: SEOConfig = {
    developerName: 'whoever you are'
  };

  public static isValid(): boolean {
    return true;
  }

  protected loadMedia(): void {
    this.addSomeComponent();
  }

  private addSomeComponent(): void {
    this.player.ui.addComponent({
      label: 'seo',
      area: ui.ReservedPresetAreas.InteractiveArea,
      presets: [ui.ReservedPresetNames.Playback, ui.ReservedPresetNames.Live],
      get: () => <SomeComponent developerName={this.config.developerName} />
    });
  }
}
