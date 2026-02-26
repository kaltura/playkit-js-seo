export interface KalturaAttachmentAssetArgs {
  id: string;
  fileExt: string;
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
    this.downloadUrl = '';
    this.objectType = attachmentAsset.objectType;
    this.filename = attachmentAsset.filename;
  }
}

export interface KalturaCaptionAssetArgs {
  id: string;
  fileExt: string;
  content: [];
}

export class KalturaCaptionAsset {
  public id: string;
  public fileExt: string;
  public content: Array<any>;

  constructor(captionAsset: KalturaCaptionAssetArgs) {
    this.id = captionAsset.id;
    this.fileExt = captionAsset.fileExt;
    this.content = [];
  }
}
