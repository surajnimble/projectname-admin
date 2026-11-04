import { ApiRequest, BaseResponse } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

// The request/response contract lives in lib/api-contract; this module keeps the
// app-side parsing (the backend's own message is part of it).
export { ApiRequest, BaseResponse };

export type Mapper<T> = (raw: never) => T;

export function failure<T>(message: string, mapper: Mapper<T>): BaseResponse<T> {
  return new BaseResponse({ status: false, message, data: mapper({} as never) });
}

export function parseResponse<T>(json: string, mapper: Mapper<T>): BaseResponse<T> {
  try {
    const parsed = JSON.parse(json) as { status?: boolean; message?: string; result?: unknown };
    const message = typeof parsed.message === 'string' ? parsed.message : '';
    return new BaseResponse({
      status: parsed.status === true,
      message,
      data: mapper((parsed.result ?? {}) as never),
    });
  } catch {
    return failure(MESSAGES.errors.invalidResponse, mapper);
  }
}