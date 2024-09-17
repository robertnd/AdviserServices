export type UpdateDto<T> = {
    user_id: string
    entity?: T
    entity_type?: string
} & ( Active | Inactive )

type Active = {
    status: 'Active'
}

type Inactive = {
    status: 'Inactive'
}

type PasswordReset = {
    status: 'PasswordReset'
}