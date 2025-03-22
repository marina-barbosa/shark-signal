// Response.cs
export interface ApiResponse<T>{
    isSuccess: boolean;
    data: T;
    error: string | null;
    message: string | null;
}