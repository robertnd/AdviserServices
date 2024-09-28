export type IPRSResponse = {
    status: string
    statusCode: number
    data: Data
}

type Data = {
    id: number
    date_of_issue: string
    ethnic_group: string
    family: string
    first_name: string
    gender: string
    id_number: string
    occupation: string
    other_name: string
    pin: string
    place_of_birth: string
    place_of_death: string
    place_of_live: string
    reg_office: string
    serial_number: string
    surname: string
    created_at: string
    updated_at: string
    citizenship: string
    clan: string
    date_of_birth: string
    date_of_death: string
    date_of_birth_from_passport: string
    date_of_expiry: string
    identification_type: string
    photo: string
    fingerprint: string
    signature: string
    photo_from_passport: string
}
