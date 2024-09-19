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

const createAdviser = async (regDto: RegistrationDto): Promise<Result<any, any>> => {
    var digest = ''
    // These 4 inserts need to happen in concert
    if (regDto.dpAdviser) {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            const { kra_pin, account_no, partner_number, intermediary_type, load_date, primary_email, country } = regDto.dpAdviser
            const insertAdviser = `INSERT INTO adviser (kra_pin, account_number, partner_number, intermediary_type, load_date, country)
                                 VALUES ( $1, $2, $3, $4, $5, $6) RETURNING *`
            const result1: QueryResult<any> = await client.query(
                insertAdviser,
                [kra_pin, account_no, partner_number, intermediary_type, load_date, country]
            )
            // get row id of inserted record
            const { id } = result1.rows[0]
            const { user_id } = regDto
            digest = await argon2.hash(regDto.password)
            const insertCreds = `INSERT INTO credentials ( user_id, email, adviser_id, digest, credential_type, status ) 
            VALUES ( $1, $2, $3, $4, $5, $6 ) RETURNING *`
            var cred_type = 'Non-Individual'
            if (regDto.dpAdviser.gender && regDto.dpAdviser.gender !== '') {
                cred_type = 'Individual'
            }
            const result2: QueryResult<any> = await client.query(insertCreds, [user_id, primary_email, id, digest, cred_type, 'New'])

            const { mobile_no, secondary_mobile, secondary_email, primary_phone, secondary_phone, primary_address, secondary_address, city, secondary_city } = regDto.dpAdviser
            const insertContacts = `INSERT INTO adviser_contacts ( adviser_id, mobile_no, secondary_mobile_no, primary_email, secondary_email, fixed_phone_no, secondary_fixed_phone_no, primary_address, secondary_address, city, secondary_city, country ) 
            VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`
            const result3: QueryResult<any> = await client.query(
                insertContacts,
                [id, mobile_no, secondary_mobile, primary_email, secondary_email, primary_phone, secondary_phone, primary_address, secondary_address, city, secondary_city, country]
            )

            const { id_number, id_type, date_of_birth, first_name, last_name, full_names, gender } = regDto.dpAdviser
            const insertPerson = `INSERT INTO adviser_person ( adviser_id, user_id, id_doc_number, id_doc_type, date_of_birth, first_name, last_name, full_names, gender ) 
            VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 ) RETURNING *`
            const result4: QueryResult<any> = await client.query(
                insertPerson,
                [id, user_id, id_number, id_type, date_of_birth, first_name, last_name, full_names, gender]
            )

            await client.query('COMMIT')
            const created = result1.rows[0]
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
    } else {
        return {
            success: false,
            errorData: 'Registration data is invalid'
        }
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

    if ( key == 'mobile_no' ) {
        const mobile_no = query.value
        const otp = UtilServices.generateOTP()
        try {
            UtilServices.addOTP(otp)
            const resp = UtilServices.sendSMS( mobile_no, `One-time code: ${otp}`)
            console.log(JSON.stringify(resp))
        } catch(err) {
            console.log(JSON.stringify(err))
        }
    }
    
    var recordNum = Math.floor(Math.random() * 999) + 1
    var modded = fadvisers[recordNum]
    modded.intermediary_type = 'Broker'
    modded.id_type = 'National ID'
    return modded
}

// : Promise<{ success: boolean, data?: number, errorData?: any }>
const checkIfAdviserExists = async (user_id: string): Promise<Result<number, any>> => {
    try {
        const queryAdviser = `SELECT COUNT(*) FROM credentials WHERE user_id=$1`
        const result: QueryResult<any> = await pool.query(queryAdviser, [user_id])
        const { count } = result.rows[0]
        return {
            success: true,
            data: parseInt(count)
        }
    } catch (err) {
        return {
            success: false,
            errorData: err
        }
    }
}

const signIn = async (user_id: string, password: string): Promise<Result<string, any>> => {
    const result = await UtilServices.getDigest(user_id)
    if (result.success) {
        let storedDigest = result.data || ''
        let valid = await argon2.verify(storedDigest, password)
        if (valid) {
            const JWT_SECRET = config.jwt_secret as string
            const EXPIRES = config.jwt_validity
            const jwtOptions = {
                issuer: `${config.jwt_issuer}`,
                subject: user_id,
                expiresIn: EXPIRES,
            }
            const token = jwt.sign({ id: user_id, role: 'user' }, JWT_SECRET, jwtOptions)
            return {
                success: true,
                data: token
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

const getAdviser = async (user_id: string): Promise<Result<any, any>> => {

    try {
        const queryAdviser = `SELECT * FROM all_advisers WHERE user_id=$1 LIMIT 1`
        const result = await pool.query(queryAdviser, [user_id])
        if (result.rows.length > 0) {
            return {
                success: true,
                data: result.rows[0]
            }
        } else {
            return {
                success: false,
                errorData: `Adviser with id: ${user_id} not found`
            }
        }
    } catch (err) {
        return {
            success: false,
            errorData: err
        }
    }
}

export const AdviserServices = {
    createAdviser,
    queryPlatformAdviser,
    checkIfAdviserExists,
    signIn,
    getAdviser,
    setPassword
}