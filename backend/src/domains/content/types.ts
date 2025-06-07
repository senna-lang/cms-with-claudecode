/**
 * Content domain branded types for type safety
 */

type Branded<T, B> = T & { _brand: B };

export type ContentId = Branded<string, "ContentId">;
export type UserId = Branded<string, "UserId">;
export type CategoryId = Branded<string, "CategoryId">;
export type TagId = Branded<string, "TagId">;

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
