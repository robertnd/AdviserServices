export type UserDto = {
    adviser_id: string
    user_id: string
    id_doc_number: string
    id_doc_type: string
    mobile_no: string
    email: string
    date_of_birth: string
    first_name: string
    last_name: string
    gender: string
    password: string
} & ( AdviserAdmin | AdviserUser )

type AdviserAdmin = {
    admin: true
    credential_type: 'adviser-admin'
}

type AdviserUser = {
    admin: true
    credential_type: 'adviser-user'
}