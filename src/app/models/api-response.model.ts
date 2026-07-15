export interface ApiResponse<T> {
  success: boolean;
  message: string;
  count: number;
  data: T;
}