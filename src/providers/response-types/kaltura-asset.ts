export interface KalturaAttachmentAssetArgs {
  id: string;
  fileExt: string;
  downloadUrl: string;
  objectType: string;
  filename: string;
}

export class KalturaAttachmentAsset {
  public id: string;
  public fileExt: string;
  public downloadUrl: string;
  public objectType: string;
  public filename: string;

  constructor(attachmentAsset: KalturaAttachmentAssetArgs) {
    this.id = attachmentAsset.id;
    this.fileExt = attachmentAsset.fileExt;
    this.downloadUrl = attachmentAsset.downloadUrl;
    this.objectType = attachmentAsset.objectType;
    this.filename = attachmentAsset.filename;
  }
}

export interface KalturaCaptionAssetArgs {
  id: string;
  fileExt: string;
  content: [];
  displayOnPlayer: boolean
  usage: number | string;
}

export class KalturaCaptionAsset {
  public id: string;
  public fileExt: string;
  public content: Array<any>;
  public displayOnPlayer: boolean;
  public usage: number | string;

  constructor(captionAsset: KalturaCaptionAssetArgs) {
    this.id = captionAsset.id;
    this.fileExt = captionAsset.fileExt;
    this.content = [];
    this.displayOnPlayer = captionAsset.displayOnPlayer;
    this.usage = captionAsset.usage
  }
}
