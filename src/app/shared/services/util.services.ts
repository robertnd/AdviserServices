import { ServiceEvent } from "../dto/event"
import pool from "../../config/database"
import config from "../../config"
import { Result } from "../dto/result"
import axios, { AxiosResponse } from "axios"

const otpStore = new Map<string, number>()

const storeEvent = async (event: ServiceEvent) => {
    if (config.store_events as string != 'Yes') {
        return
    }
    try {
        // console.log(pool)
        const insertEvent = `INSERT INTO event (user_id, event_type, endpoint, direction, process, step, status)
                                 VALUES ( $1, $2, $3, $4, $5, $6, $7) RETURNING *`
        const result = await pool.query(insertEvent, [
            event.user_id, event.event_type, event.endpoint, event.direction, event.process, event.step, event.status]
        )
        const created = result.rows[0]
        const insertPayload = `INSERT INTO event_payload (event_id, request, result, response)
                                 VALUES ( $1, $2, $3, $4) RETURNING *`

        const result2 = await pool.query(insertPayload, [
            created.id, event.request, event.result, event.response])

        return {
            success: result.rows.length > 0 && result2.rows.length > 0,
            data: {
                update1: result,
                update2: result2
            }
        }
    } catch (err) {
        // TODO: add logging
        console.log(JSON.stringify(err))
        return {
            success: false,
            errorData: err
        }
    }
}

// Promise<{ success: boolean, data?: string, errorData?: any }>
const getDigest = async (user_id: string): Promise<Result<string, any>> => {
    try {
        const queryAdviser = `SELECT digest FROM credentials WHERE user_id=$1`
        const result = await pool.query(queryAdviser, [ user_id ])
        return {
            success: true,
            data: result.rows[0].digest
        }
    } catch (err) {
        return {
            success: false,
            errorData: err
        }
    }
}

const getAdminDigest = async (user_id: string): Promise<Result<string, any>> => {
    try {
        const queryAdviser = `SELECT digest FROM admins WHERE user_id=$1`
        const result = await pool.query(queryAdviser, [ user_id ])
        return {
            success: true,
            data: result.rows[0].digest
        }
    } catch (err) {
        return {
            success: false,
            errorData: err
        }
    }
}

const sendSMS = async (mobile: string, message: string): Promise<Result<string, any>> => {
    const SMSAPI =  config.sms_ep!
    const request = {
        apikey: config.sms_apikey,
        partnerID: config.sms_partner_id,
        message,
        shortcode: config.sms_shortcode,
        mobile
    }

    try {
        const client = axios.create({ baseURL: SMSAPI })
        const resp = await client.post(SMSAPI, request)
        return {
            success: true,
            data: 'Message queued'
        }
     } catch (errorData) {
        return {
            success: false,
            errorData
        }
     }
}

function generateOTP() {
    const characters = 'ABCD0123456789EFGHIJK0123456789LMNOPQRSTUVWXY0123456789Zabcdefghvijklmnopqrst0123456789uvwxyz0123456789'
    let result = ''

    let slength = config.otp_length || '6'
    let length = parseInt(slength)
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        result += characters[randomIndex]
    }

    return result
}

function addOTP(otp: string) {
    otpStore.set(otp, new Date().valueOf())
}

function getOTP(otp: string) {
    const rotp = otpStore.get(otp)
    if (rotp) {
        return { success: true, data: otp }
    } 
    return  { success: false, errorData: 'Not found' }
}

export const UtilServices = {
    storeEvent,
    getDigest,
    getAdminDigest,
    sendSMS,
    generateOTP,
    addOTP,
    getOTP
}