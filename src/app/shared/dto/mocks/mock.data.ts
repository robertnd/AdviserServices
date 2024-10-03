export function okIprsQuery() {
    return {
        id: 97096,
        date_of_issue: '7/11/2008 12:00:00 AM',
        ethnic_group: null,
        family: null,
        first_name: 'ROBERT',
        gender: 'M',
        id_number: '21909195',
        occupation: 'UNEMPLOYED',
        other_name: 'GITHINJI',
        pin: '18007100010301',
        place_of_birth: 'KIAMBU DISTRICT - KIAMBU',
        place_of_death: null,
        place_of_live: null,
        reg_office: 'CENTRAL STAREHE',
        serial_number: '224778291',
        surname: 'NDONGA',
        created_at: '2024-09-26T11:00:23.000000Z',
        updated_at: '2024-09-26T11:00:23.000000Z',
        citizenship: 'Kenyan',
        clan: null,
        date_of_birth: '7/10/1980 12:00:00 AM',
        date_of_death: null,
        date_of_birth_from_passport: null,
        date_of_expiry: null,
        identification_type: 'national_id',
        photo: '',
        fingerprint: '',
        signature: '',
        photo_from_passport: null
    }
}

export function failedIprsResponse() {
    return {
        status: 'error',
        message: '@Controller - @queryIPRS/else - An error occurred',
        errorData: {
            message: 'Request failed with status code 422',
            code: 'ERR_BAD_REQUEST',
            status: 422
        }
    }
}

export function failedIprsData() {
    return {
        message: 'Request failed with status code 422',
        code: 'ERR_BAD_REQUEST',
        status: 422
    }
}