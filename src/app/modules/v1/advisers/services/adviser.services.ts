import { QueryResult } from "pg"
import pool from "../../../../config/database"
import { AdviserQuery } from "../interfaces/adviser-query-dto.interface"
import { fadvisers } from "../../../../_components/fadvisers.dpmock"
import { DataPlatformAdviser } from "../dto/data_platform/data-platform.adviser.dto"
import { RegistrationDto } from "../dto/controllers/request/register.existing.dto"
import argon2 from "argon2"
import jwt from "jsonwebtoken"
import config from "../../../../config"
import { Result } from "../../../../shared/dto/result"
import { UtilServices } from "../../../../shared/services/util.services"
import { UserDto } from "../dto/user.dto"

const createAdviser = async (regDto: RegistrationDto): Promise<Result<any, any>> => {
    var digest = ''
    // These 4 inserts need to happen in concert
    if (regDto.dpAdviser) {
        const client = await pool.connect()
        // TODO: this information will need to come from an external source
        var legal_entity_type = 'person'
        try {
            await client.query('BEGIN')
            const { kra_pin, account_no, partner_number, intermediary_type, load_date, primary_email, mobile_no, country } = regDto.dpAdviser
            const insertAdviser = `INSERT INTO adviser (kra_pin, account_number, partner_number, intermediary_type, legal_entity_type, load_date, country)
                                 VALUES ( $1, $2, $3, $4, $5, $6, $7) RETURNING *`
            const result1: QueryResult<any> = await client.query(
                insertAdviser,
                [kra_pin, account_no, partner_number, intermediary_type, legal_entity_type, load_date, country]
            )
            // get row id of inserted record
            const { id } = result1.rows[0]
            const { user_id } = regDto
            digest = await argon2.hash(regDto.password)
            const insertCreds = `INSERT INTO credentials ( user_id, email, mobile_no, adviser_id, digest, credential_type, status ) 
            VALUES ( $1, $2, $3, $4, $5, $6, $7 ) RETURNING *`
            var cred_type = 'adviser-admin'
            const result2: QueryResult<any> = await client.query(insertCreds, [user_id, primary_email, mobile_no, id, digest, cred_type, 'New'])

            const { secondary_mobile, secondary_email, primary_phone, secondary_phone, primary_address, secondary_address, city, secondary_city } = regDto.dpAdviser
            const insertContacts = `INSERT INTO adviser_contacts ( adviser_id, mobile_no, secondary_mobile_no, primary_email, secondary_email, fixed_phone_no, secondary_fixed_phone_no, primary_address, secondary_address, city, secondary_city, country ) 
            VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`
            const result3  = await client.query(
                insertContacts,
                [id, mobile_no, secondary_mobile, primary_email, secondary_email, primary_phone, secondary_phone, primary_address, secondary_address, city, secondary_city, country]
            )

            var result4
            const { id_number, id_type, first_name, last_name, full_names, gender } = regDto.dpAdviser
            if ( legal_entity_type == 'person' ) {
                const { date_of_birth } = regDto.dpAdviser
                const insertPerson = `INSERT INTO adviser_person ( adviser_id, user_id, id_number, id_type, date_of_birth, first_name, last_name, full_names, gender ) 
                VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 ) RETURNING *`
                result4 = await client.query(
                    insertPerson,
                    [id, user_id, id_number, id_type, date_of_birth, first_name, last_name, full_names, gender]
                )
            } else {
                // TODO: Internal testing only. No biz requirements yet
                const dateOfInc = new Date(Date.now()).toISOString()
                const names = 'Big Bucks Agency'
                const insertNonPerson = `INSERT INTO adviser_nonperson ( adviser_id, user_id, id_number, id_type, date_of_incorporation, names ) 
                VALUES ( $1, $2, $3, $4, $5, $6) RETURNING *`
                result4 = await client.query(
                    insertNonPerson,
                    [id, user_id, id_number, id_type, dateOfInc, names]
                )
            }

            await client.query('COMMIT')
            const created = {
                adviser: result1.rows[0] 
                            ? { kra_pin, account_no, partner_number, intermediary_type, legal_entity_type, country }
                            : {},
                credentials: result2.rows[0] 
                            ? { user_id, email: primary_email, mobile_no, id, credential_type: cred_type }
                            : {},
                contacts: result3.rows[0]
                            ? result3.rows[0]
                            : {},
                entity: result4.rows[0] 
                            ? result4.rows[0]
                            : {}
            }
            return { success: true, data: created }
        } catch (err) {
            // TODO: add logging
            await client.query('ROLLBACK')
            // console.log(err)
            console.log(JSON.stringify(err))
            return {
                success: false,
                errorData: err
            }
        } finally {
            client.release()
        }
    } else {
        return {
            success: false,
            errorData: 'Registration data is invalid'
        }
    }
}

const createAdviserUser = async (userDto: UserDto): Promise<Result<any, any>> => {
    var digest = ''

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const insertUser = `INSERT INTO adviser_user ( adviser_id, user_id, id_doc_number, id_doc_type, mobile_no, email, date_of_birth, first_name, last_name, gender ) 
            VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING *`
        const result1: QueryResult<any> = await client.query(
            insertUser,
            [userDto.adviser_id, userDto.user_id, userDto.id_doc_number, userDto.id_doc_type, userDto.mobile_no, userDto.email, userDto.date_of_birth, userDto.first_name, userDto.last_name, userDto.gender]
        )
        const created = result1.rows[0]
        digest = await argon2.hash(userDto.password)
        const insertCreds = `INSERT INTO credentials ( user_id, email, mobile_no, adviser_id, digest, credential_type, status ) 
            VALUES ( $1, $2, $3, $4, $5, $6 ) RETURNING *`
        const result2: QueryResult<any> = await client.query(insertCreds, [userDto.user_id, userDto.email, userDto.mobile_no, userDto.adviser_id, digest, userDto.credential_type, 'Active'])
        await client.query('COMMIT')

        return { success: true, data: {} }
    } catch (err) {
        // TODO: add logging
        await client.query('ROLLBACK')
        // console.log(err)
        console.log(JSON.stringify(err))
        return {
            success: false,
            errorData: err
        }
    } finally {
        client.release()
    }
}

const setPassword = async (user_id: string, password: string): Promise<Result<any, any>> => {
    try {
        const digest = await argon2.hash(password)
        const updateCreds = `UPDATE credentials SET digest=$1 WHERE user_id=$2 RETURNING *`
        const result = await pool.query(updateCreds, [digest, user_id])
        const updated = result.rowCount && result.rowCount > 0 ? true : false
        if (updated) {
            return { success: true, data: result.rowCount }
        } else {
            return { success: false, errorData: `Update failed. No matching records with id ${user_id}` }
        }
    } catch (err) {
        return {
            success: false,
            errorData: err
        }
    }
}

const queryPlatformAdviser = async (query: AdviserQuery): Promise<DataPlatformAdviser> => {
    console.log('Query Obj: ', JSON.stringify(query))
    const { key } = query

    if (key == 'mobile_no') {
        const mobile_no = query.value
        const otp = UtilServices.generateOTP()
        try {
            UtilServices.addOTP(otp)
            const resp = UtilServices.sendSMS(mobile_no, `One-time code: ${otp}`)
            console.log(JSON.stringify(resp))
        } catch (err) {
            console.log(JSON.stringify(err))
        }
    }

    var recordNum = Math.floor(Math.random() * 999) + 1
    var modded = fadvisers[recordNum]
    modded.intermediary_type = 'Broker'
    modded.id_type = 'National ID'
    return modded
}

const signIn = async (user_id: string, password: string, payload?: any): Promise<Result<any, any>> => {
    const profile = await AdviserServices.getProfile(user_id)
    if (profile.success) {
        let storedDigest = profile.data.credentials.digest || ''
        let valid = await argon2.verify(storedDigest, password)
        if (valid) {
            const JWT_SECRET = config.jwt_secret as string
            const EXPIRES = config.jwt_validity
            const jwtOptions = {
                issuer: `${config.jwt_issuer}`,
                subject: user_id,
                expiresIn: EXPIRES,
            }

            // shorten
            const credentials = profile.data.credentials
            const adviser = profile.data.adviser
            const user = profile.data.adviser_user

            // store all this in the token
            const adviserProfile = {
                adviser_names: adviser.names,
                adviser_id: adviser.adviser_id,
                adviser_address: `${adviser.address}, ${adviser.city}`,
                adviser_mobile_no: adviser.mobile_no,
                adviser_fixed_phone: adviser.fixed_phone,
                adviser_email: adviser.email,
                adviser_kra_pin: adviser.kra_pin,
                adviser_account_number: adviser.account_number,
                adviser_partner_number: adviser.partner_number,
                adviser_intermediary_type: adviser.intermediary_type
            }
            const payload = {
                user_id,
                email: credentials.email,
                mobile_no: user ? user.mobile_no : adviser.mobile_no,
                names: user ? `${user.first_name} ${user.last_name}` : adviser.names,
                role: credentials.credential_type,
                adviser: adviserProfile
            }
            // const token = jwt.sign({ id: user_id, role: 'user' }, JWT_SECRET, jwtOptions)
            const token = jwt.sign(payload, JWT_SECRET, jwtOptions)
            return {
                success: true,
                data: {
                    token,
                    names: user ? `${user.first_name} ${user.last_name}` : adviser.names,
                    email: credentials.email
                }
            }
        } else {
            // TODO: usecase related stuff here
            // -> loginAttemptLogger( ... )
            return {
                success: false,
                errorData: 'password is invalid'
            }
        }
    } else {
        // TODO: usecase related stuff here
        // -> loginAttemptLogger( ... )
        return {
            success: false,
            errorData: 'Error computing digest'
        }
    }
}

const getCredentials = async (user_id: string): Promise<Result<any, any>> => {
    const queryResult = await UtilServices.genQuery('credentials', 'user_id', user_id)
    if (queryResult.success) return { success: true, data: queryResult.data.rows[0] }
    return {
        success: false,
        errorData: queryResult.success == false
            ? queryResult.errorData || `Unknown error occurred @getCredentials with user_id = ${user_id}`
            : `Unknown error occurred @getCredentials with user_id = ${user_id}`
    }
}

const getAdviser = async (user_id: string): Promise<Result<any, any>> => {
    const queryResult = await UtilServices.genQuery('all_advisers', 'user_id', user_id)
    if (queryResult.success) return { success: true, data: queryResult.data.rows[0] }
    return {
        success: false,
        errorData: queryResult.success == false
            ? queryResult.errorData || `Unknown error occurred @getAdviser with user_id = ${user_id}`
            : `Unknown error occurred @getAdviser with user_id = ${user_id}`
    }
}

const getAdviserUser = async (user_id: string): Promise<Result<any, any>> => {
    const queryResult = await UtilServices.genQuery('adviser_user', 'user_id', user_id)
    if (queryResult.success) return { success: true, data: queryResult.data.rows[0] }
    return {
        success: false,
        errorData: queryResult.success == false
            ? queryResult.errorData || `Unknown error occurred @getAdviserUser with user_id = ${user_id}`
            : `Unknown error occurred @getAdviserUser with user_id = ${user_id}`
    }
}

const checkIfAdviserExists = async (user_id: string): Promise<boolean> => {
    const adviser = await getAdviser(user_id)
    return adviser.success
}

const getProfile = async (user_id: string): Promise<Result<any, any>> => {
    const credentials = await getCredentials(user_id)
    const adviser = await getAdviser(user_id)
    const adviser_user = await getAdviserUser(user_id)
    if (credentials.success && adviser.success) {
        if (adviser_user.success) {
            return {
                success: true,
                data: {
                    credentials: credentials.data,
                    adviser: adviser.data,
                    adviser_user: adviser_user.data
                }
            }
        } else {
            return {
                success: true,
                data: {
                    credentials: credentials.data,
                    adviser: adviser.data
                }
            }
        }
    } else {
        var errors: any = []
        if (credentials.success == false && credentials.errorData) errors.push[credentials.errorData]
        if (adviser.success == false && adviser.errorData) errors.push[adviser.errorData]
        if (adviser_user.success == false && adviser_user.errorData) errors.push[adviser_user.errorData]
        return {
            success: false,
            errorData: errors
        }
    }
}

export const AdviserServices = {
    createAdviser,
    queryPlatformAdviser,
    checkIfAdviserExists,
    signIn,
    setPassword,
    getProfile,
    getCredentials,
    getAdviser
}