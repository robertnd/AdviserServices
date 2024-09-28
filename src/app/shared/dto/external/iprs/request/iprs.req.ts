export type IPRSRequest = {
    identification: string
} & ( NationalID | AlienID | PassportNo )

type NationalID = {
    id_type: 'national_id'
}

type AlienID = {
    id_type: 'alien_id'
}

type PassportNo = {
    id_type: 'passport_no'
}