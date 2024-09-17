export type ApiResponse<T, E> = 
| { status: 'success'; data?: T }
| { status: 'error'; message: string; errorData?: E }