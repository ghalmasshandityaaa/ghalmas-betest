import { isNativeError } from 'util/types';

export type ResultOk<T> = {
  ok: true;
  value: T;
};
export type ResultError<E extends Error = Error> = {
  ok: false;
  error: E;
};
export type Result<T, E extends Error = Error> = ResultOk<T> | ResultError<E>;

export function resultOk<T>(value: T): ResultOk<T> {
  return {
    ok: true,
    value,
  };
}

export function resultError<E extends Error = Error>(e: E): ResultError<E> {
  return {
    ok: false,
    error: e,
  };
}

export function computeResult<T>(lazypromise: () => Promise<T>): Promise<Result<T, Error>>;

export function computeResult<T>(
  lazypromiselike: () => PromiseLike<T>,
): PromiseLike<Result<T, Error>>;

export function computeResult<T>(lazytask: () => T): Result<T, Error>;

export function computeResult<T>(
  fn: () => T | PromiseLike<T>,
): Result<T, Error> | PromiseLike<Result<T, Error>> {
  try {
    const value = fn();

    if (isPromiseLike(value)) {
      return value.then(
        v => resultOk(v),
        e => resultError(ensureError(e)),
      );
    }

    return resultOk(value);
  } catch (err) {
    const error = ensureError(err);
    return resultError(error);
  }
}

/* Utils */
export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

export function ensureError(error: unknown): Error {
  if (isNativeError(error)) {
    return error;
  }
  return new Error(String(error));
}

export function handleResponse<T>(data?: T): { ok: boolean; data?: T } {
  return {
    ok: true,
    data,
  };
}
