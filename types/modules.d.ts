declare module "types/seo-config" {
    export type SEOConfig = {
        developerName: string;
    };
}
declare module "ui/more-icon/some-component.component" {
    import { Component, ComponentChild } from 'preact';
    import { PlaykitUI } from '@playkit-js/kaltura-player-js';
    import EventManager = PlaykitUI.EventManager;
    type MoreIconState = {
        toggle: boolean;
    };
    type SomeComponentProps = {
        developerName: string;
        greetingTxt?: string;
        eventManager?: EventManager;
    };
    export class SomeComponent extends Component<SomeComponentProps, MoreIconState> {
        render(): ComponentChild;
    }
}
declare module "seo" {
    import { BasePlugin } from '@playkit-js/kaltura-player-js';
    import { SEOConfig } from "types/seo-config";
    export const pluginName = "seo";
    export class Seo extends BasePlugin<SEOConfig> {
        protected static defaultConfig: SEOConfig;
        static isValid(): boolean;
        protected loadMedia(): void;
        private addSomeComponent;
    }
}
declare module "index" { }
