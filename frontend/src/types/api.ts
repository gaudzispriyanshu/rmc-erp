/** Shared response shapes. Domain DTOs live in features/<module>/types. */
export type Paginated<T> = {
  data: T[];
  count: number;
};

export type ListParams = {
  start?: number;
  end?: number;
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
};
