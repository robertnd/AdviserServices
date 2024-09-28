import { QueryResult } from "pg"
import pool from "../../../config/database"
import argon2 from "argon2"
import jwt from "jsonwebtoken"
import config from "../../../config"
import { Result } from "../../../shared/dto/result"
import { AdminDto } from "../dto/controllers/admin.dto"
import { UtilServices } from "../../../shared/services/util.services"

const rootSignIn = async (secret: string): Promise<Result<string, any>> => {

    const JWT_SECRET = config.jwt_secret as string
    if (secret !== JWT_SECRET) {
        return {
            success: false,
            errorData: 'Secret is invalid'
        }
    } else {
        const EXPIRES = config.jwt_validity
        const jwtOptions = {
            issuer: `${config.jwt_issuer}`,
            subject: 'root',
            expiresIn: EXPIRES,
        }
        const token = jwt.sign({ id: 'root', role: 'root' }, JWT_SECRET, jwtOptions)
        return {
            success: true,
            data: token
        }
    }
}

const checkIfAdminExists = async (user_id: string): Promise<boolean> => {
    const queryResult = await getAdminCredentials(user_id)
    return queryResult.success
}

const createAdmin = async (adminDto: AdminDto): Promise<Result<any, any>> => {
    try {
        const digest = await argon2.hash(adminDto.password)
        const insertAdviser = `INSERT INTO admins (user_id, email, mobile_no, digest)
                                 VALUES ( $1, $2, $3, $4) RETURNING *`
        await pool.query(insertAdviser, [adminDto.user_id, adminDto.email, adminDto.mobile_no, digest])
        return {
            success: true, data: {
                user_id: adminDto.user_id,
                email: adminDto.email,
                mobile_no: adminDto.mobile_no
            }
        }
    } catch (err) {
        return {
            success: false,
            errorData: err
        }
    }
}

const getAdminCredentials = async (user_id: string): Promise<Result<any, any>> => {
    const queryResult = await UtilServices.genQuery('admins', 'user_id', user_id)
    if (queryResult.success) return { success: true, data: queryResult.data.rows[0] }
    return {
        success: false,
        errorData: queryResult.success == false
            ? queryResult.errorData || `Unknown error occurred @getAdminCredentials with user_id = ${user_id}`
            : `Unknown error occurred @getCredgetAdminCredentialsentials with user_id = ${user_id}`
    }
}

const adminSignIn = async (user_id: string, password: string): Promise<Result<any, any>> => {
    const result = await getAdminCredentials(user_id)
    if (result.success) {
        let storedDigest = result.data.digest || ''
        let valid = await argon2.verify(storedDigest, password)
        if (valid) {
            const JWT_SECRET = config.jwt_secret as string
            const EXPIRES = config.jwt_validity
            const jwtOptions = {
                issuer: `${config.jwt_issuer}`,
                subject: user_id,
                expiresIn: EXPIRES,
            }
            // admin => OM admin, adviser-admin => Local Adviser Admin, adviser-user
            const token = jwt.sign({ id: user_id, role: 'admin' }, JWT_SECRET, jwtOptions)
            return {
                success: true,
                data: token
            }
        } else {
            return {
                success: false,
                errorData: 'password is invalid'
            }
        }
    } else {
        return {
            success: false,
            errorData: 'Error computing digest'
        }
    }
}

const getAdminsWithPaging = async (vPage: number, pageSize: number): Promise<Result<any, any>> => {

    const page = vPage || 1;
    const limit = pageSize
    const offset = (page - 1) * limit;

    try {
        const queryAdmins = `SELECT id, user_id, email, status, create_date FROM admins LIMIT $1 OFFSET $2`
        const result = await pool.query(queryAdmins, [limit, offset])
        return {
            success: true,
            data: {
                page,
                limit,
                totalItems: result.rowCount,
                admins: result.rows
            }
        }
    } catch (err) {
        return {
            success: false,
            errorData: err
        }
    }
}

const updateAdminStatus = async (user_id: string, status: string): Promise<Result<any, any>> => {
    if (user_id && status) {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            const updateCreds = `UPDATE admins SET status=$1 WHERE user_id=$2 RETURNING *`
            const result: QueryResult<any> = await client.query(updateCreds, [status, user_id])
            await client.query('COMMIT')
            // const created = result.rows[0]
            return { success: true, data: 'updated' }
        } catch (err) {
            // TODO: add logging
            await client.query('ROLLBACK')
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
            errorData: 'Request data is invalid'
        }
    }
}

const getAdvisersWithPaging = async (vPage: number, pageSize: number): Promise<Result<any, any>> => {

    const page = vPage || 1;
    const limit = pageSize
    const offset = (page - 1) * limit;

    try {
        const queryAdvisers = `SELECT * FROM all_advisers LIMIT $1 OFFSET $2`
        const result: QueryResult<any> = await pool.query(queryAdvisers, [limit, offset])
        return {
            success: true,
            data: {
                page,
                limit,
                totalItems: result.rowCount,
                advisers: result.rows
            }
        }
    } catch (err) {
        return {
            success: false,
            errorData: err
        }
    }
}

const getAdviser = async (user_id: string): Promise<Result<any, any>> => {

    try {
        const queryAdviser = `SELECT * FROM all_advisers WHERE user_id=$1`
        const result: QueryResult<any> = await pool.query(queryAdviser, [user_id])
        if (result.rows.length > 0) {
            return {
                success: true,
                data: result.rows[0]
            }
        } else {
            return {
                success: false,
                errorData: `Adviser with user-id: ${user_id} not found`
            }
        }
    } catch (err) {
        return {
            success: false,
            errorData: err
        }
    }
}

const updateAdviserStatus = async (user_id: string, status: string): Promise<Result<any, any>> => {
    if (user_id && status) {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            const updateCreds = `UPDATE credentials SET status=$1 WHERE user_id=$2 RETURNING *`
            const result: QueryResult<any> = await client.query(updateCreds, [status, user_id])
            await client.query('COMMIT')
            // const created = result.rows[0]
            return { success: true, data: 'updated' }
        } catch (err) {
            // TODO: add logging
            await client.query('ROLLBACK')
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
            errorData: 'Request data is invalid'
        }
    }
}

const getEventsWithPaging = async (vPage: number, pageSize: number): Promise<Result<any, any>> => {

    const page = vPage || 1;
    const limit = pageSize
    const offset = (page - 1) * limit;

    try {
        const queryEvents = `SELECT * FROM event LIMIT $1 OFFSET $2`
        const result: QueryResult<any> = await pool.query(queryEvents, [limit, offset])
        return {
            success: true,
            data: {
                page,
                limit,
                totalItems: result.rowCount,
                events: result.rows
            }
        }
    } catch (err) {
        return {
            success: false,
            errorData: err
        }
    }
}

const getEvent = async (event_id: number): Promise<Result<any, any>> => {

    try {
        const queryEvent = `SELECT e.id, ep.id as epid, e.trace_id, e.user_id, e.create_date, e.event_type, e.endpoint, e.direction, e.process, e.step, e.status,  ep.request, ep.result, ep.response
                            FROM event e, event_payload ep  WHERE e.id = ep.event_id 
                            AND ep.event_id = $1
                            LIMIT 1`
        const result: QueryResult<any> = await pool.query(queryEvent, [event_id])
        if (result.rows.length > 0) {
            return {
                success: true,
                data: result.rows[0]
            }
        } else {
            return {
                success: false,
                errorData: `Event with id: ${event_id} not found`
            }
        }
    } catch (err) {
        return {
            success: false,
            errorData: err
        }
    }
}

export const AdminServices = {
    rootSignIn,
    adminSignIn,
    checkIfAdminExists,
    createAdmin,
    getAdminsWithPaging,
    updateAdminStatus,
    getAdvisersWithPaging,
    getAdviser,
    updateAdviserStatus,
    getEventsWithPaging,
    getEvent
}