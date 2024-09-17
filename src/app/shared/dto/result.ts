export type Result<T, E> = {
    message?: string
} & ( Success<T> | Error<E> )

type Success<T> = {
    success: true
    data: T
}

type Error<E> = {
    success: false
    errorData: E
}