import { RequestBuilder } from '@playkit-js/playkit-js-providers/ovp-provider';

export function buildRequests(items: any[], service: string, action: string, paramKey: string): RequestBuilder[] {
  const headers: Map<string, string> = new Map();
  return items.map((item: { id: string }) => {
    const request = new RequestBuilder(headers);
    request.service = service;
    request.action = action;
    request.params = { [paramKey]: item.id };
    return request;
  });
}
