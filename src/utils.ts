export const extractText = (captionContent: Array<any>): string => {
  let text = '';
  captionContent.forEach((contentItem: any) => {
    text += contentItem.content[0].text;
  });
  return text.slice(0, 4000);
};
