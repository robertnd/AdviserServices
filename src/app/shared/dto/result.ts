export type Result<T, E> = {
    message?: string
} & ( Success<T> | Error<E> )

type Success<T> = {
    success: true
    code: number
    data: T
}

type Error<E> = {
    success: false
    code: number
    errorData: E
}