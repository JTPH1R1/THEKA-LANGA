// API layer return types — every API function returns one of these shapes.
// Never throw from an API function — always return ApiResult<T>.

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

export interface Paginated<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export type PaginatedResult<T> = ApiResult<Paginated<T>>
