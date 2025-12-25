import { VNode } from 'preact';

export interface EntryMeta {
  name?: string;
  description?: string;
  tags?: string | object;
  thumbnailUrl?: string;
  duration?: number;
  createdAt?: number;
  uploadDate?: string;
  endDate?: number;
  multiLingualName?: string | Array<any>;
  multiLingualDescription?: string | Array<any>;
}

export interface Chapter {
  startTime: number;
  endTime?: number;
  name?: string;
  description?: string;
}

export enum GroupTypes {
  mid = 'mid',
  first = 'first',
  last = 'last'
}

export interface CuePoint {
  startTime: number;
  endTime?: number;
  id: string;
  type: string;
  metadata: RawItemData;
  text?: string;
}

export interface UnisphereCuePoint {
  time: number;
  endTime?: string;
  description?: string;
  title?: string;
}

export enum ItemTypes {
  All = 'All',
  AnswerOnAir = 'AnswerOnAir',
  Chapter = 'Chapter',
  Slide = 'Slide',
  Hotspot = 'Hotspot',
  Caption = 'Caption',
  QuizQuestion = 'QuizQuestion'
}

export interface RawItemData {
  cuePointType: ItemTypes;
  createdAt?: number;
  text?: string;
  description?: string;
  title?: string;
  assetId?: string;
  subType?: ItemTypes;
  partnerData?: string;
  tags?: string;
  assetUrl?: string;
  relatedObjects?: {
    QandA_ResponseProfile?: {
      objects: Array<{ xml: string }>;
    };
  };
  quizState?: number;
  isDefaultThumb?: boolean;
}

export interface ItemData extends RawItemData {
  id: string;
  startTime: number;
  previewImage: string | null;
  itemType: ItemTypes;
  displayTime?: string;
  groupData: GroupTypes | null;
  displayTitle: VNode | string;
  displayDescription: string | null;
  liveCuePoint: boolean;
  onClick?: () => void;
}

export interface TimedMetadataEvent {
  payload: {
    cues: CuePoint[];
  };
}

export interface UnisphereDataEvent {
  payload: {
    summary: string;
    chapters: UnisphereCuePoint[];
  };
}
