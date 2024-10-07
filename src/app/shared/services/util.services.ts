import { ServiceEvent } from "../dto/event"
import pool from "../../config/database"
import config from "../../config"
import { Result } from "../dto/result"
import axios, { AxiosError, AxiosResponse } from "axios"
import argon2 from "argon2"
import { PartnerNumberRequest } from "../dto/external/partner_mgmt/request/partner.no.req"

const otpStore = new Map<string, number>()
const bagOfThings = new Map<string, any>()

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

const genQuery = async (table_or_view: string, filexp: string, filval: any): Promise<Result<any, any>> => {
    try {
        const query = `SELECT * FROM ${table_or_view} WHERE ${filexp}=$1`
        const result = await pool.query(query, [ filval ])
        if (result.rows.length > 0) {
            return { 
                success: true, 
                code: 200, 
                data: result.rows.length > 1 
                ? result.rows
                : result.rows[0]
            }
        }
        else return { success: false, code: 204, errorData: `Data with ${filexp} = ${filval} not found` }
    } catch (err) {
        return { success: false, code: 500, errorData: err }
    }
}

const sendSMS = async (mobile: string, message: string): Promise<Result<string, any>> => {
    const SMSAPI = `${config.sms_host}${config.sms_endpoint}`
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
        return { success: true, code: 200, data: 'Message queued' }
    } catch (errorData) {
        return { success: false, code: 500, errorData }
    }
}

const iprsGetToken = async () => {
    var fres
    const storedToken = bagOfThings.get("iprs_token")
    if (storedToken) {
        const { access_token, expires_at } = storedToken
        if (access_token && expires_at) {
            var dateValid = true
            const date = new Date(expires_at)
            if (isNaN(date.getTime())) {
                dateValid = false
                bagOfThings.delete("iprs_token")
            }
            if (dateValid && date > new Date()) {
                return storedToken
            }
        }
    }
    const IPRS_LOGIN_API = `${config.om_iprs_host}${config.om_iprs_login_endpoint}`
    const request = {
        consumer_key: config.om_iprs_key,
        consumer_secret: config.om_iprs_secret
    }

    try {
        const client = axios.create({ baseURL: IPRS_LOGIN_API })
        const resp = await client.post(IPRS_LOGIN_API, request)
        const { data } = resp
        const { access_token, expires_at, token_type } = data
        console.log(`iprsToken__: ${access_token}`)
        fres = { access_token, expires_at, token_type }
        bagOfThings.set("iprs_token", fres)
    } catch (errorData) {
        console.log(`iprsGetToken@Exception: ${errorData}`)
        fres = JSON.stringify(errorData)
    }
    return fres
}

const iprsQuery = async (identification: string, id_type: string): Promise<Result<any, any>> => {

    const IPRS_QUERY_API = `${config.om_iprs_host}${config.om_iprs_query_endpoint}`
    const request = { identification, id_type }
    console.log(`@UtilService - @iprsQuery Request: ${JSON.stringify(request)}, IPRS_QUERY_API: ${IPRS_QUERY_API}`)
    const token = await iprsGetToken()

    if (token && token.access_token) {
        try {
            const client = axios.create({ baseURL: IPRS_QUERY_API })
            const resp = await client.post(
                IPRS_QUERY_API,
                request,
                { headers: { Authorization: `Bearer ${token.access_token}` } })
            const { data } = resp.data
            console.log(`@UtilService - Returned Profile: ${JSON.stringify(data)}`)
            return {
                success: true, code: 200, data
            }
        } catch (errorData) {
            console.log(`@UtilService - @iprsQuery - Exception Context Data: ${JSON.stringify(request)}, IPRS_QUERY_API: ${IPRS_QUERY_API}`)
            console.log(`@UtilService - iprsQuery@ - Exception: ${errorData}`)
            // const { message, code, status } = errorData
            var newError = {} as any
            if (errorData && typeof errorData === 'object') {
                if ( 'message' in errorData )  newError['message'] = errorData.message
                if ( 'code' in errorData )  newError['code'] = errorData.code
                if ( 'status' in errorData )  newError['status'] = errorData.status
            } else {
                newError = errorData
            }
            return { success: false, code: 500, errorData: newError }
        }
    }
    return { success: false, code: 500, errorData: 'Unknown error' }
}

const partnerNoQuery = async (request: PartnerNumberRequest): Promise<Result<any, any>> => {

    const PM_QUERY_API = `${config.om_partnermgmt_host}${config.om_partnermgmt_endpoint}`
    const PM_QUERY_SECRET = config.om_partnermgmt_apikey
    try {
        const client = axios.create({ baseURL: PM_QUERY_API })
        const resp = await client.post(
            PM_QUERY_API,
            request,
            { headers: { 'Ocp-Apim-Subscription-Key': PM_QUERY_SECRET } })
        const { data } = resp
        return { success: true, code: 200, data }
    } catch (errorData) {
        // console.log(`Exception@partnerNoQuery: ${errorData}`)
        // rewrite 
        const { message, code, status } = errorData as AxiosError
        return {
            success: false, code: 500, errorData: { message, code, status }
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

function setToken(token: string) {
    bagOfThings.set("iprs_token", token)
}

function getToken(token: string) {
    return bagOfThings.get("iprs_token")
}

function unsetToken(token: string) {
    bagOfThings.delete("iprs_token")
}

function addOTP(otp: string) {
    otpStore.set(otp, new Date().valueOf())
}

function getOTP(otp: string) {
    const rotp = otpStore.get(otp)
    if (rotp) {
        return { success: true, data: otp }
    }
    return { success: false, errorData: 'Not found' }
}

function singleSpaced(input: string) {
    if (input) return input.trim().replace(/\s+/g, ' ')
    else return ''
}

function extractMiddleNames(names: string) {
    var newNames = singleSpaced(names)
    const tokens = newNames.split(' ')
    if (tokens.length < 3) {
        return ''
    }
    return tokens.slice(1, -1).join(' ')
}

function rotateLeft(value: number, amount: number): number {
    return (value << amount) | (value >>> (32 - amount))
}

function toUnsigned32(n: number): number {
    return n >>> 0
}

export function hasher(input: string): string {
    const state: number[] = [
        0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476,
    ]
    const bytes = new TextEncoder().encode(input)
    let originalLength = bytes.length * 8
    const padding = (originalLength % 512 < 448) ? 448 - (originalLength % 512) : 960 - (originalLength % 512)
    const paddedLength = originalLength + padding + 64
    const paddedBytes = new Uint8Array(Math.ceil(paddedLength / 8))
    paddedBytes.set(bytes);
    paddedBytes[bytes.length] = 0x80
    for (let i = 0; i < 8; i++) {
        paddedBytes[paddedBytes.length - 8 + i] = (originalLength >>> (i * 8)) & 0xFF
    }
    for (let offset = 0; offset < paddedBytes.length; offset += 64) {
        const words: number[] = new Array(16);
        for (let i = 0; i < 16; i++) {
            words[i] = (
                (paddedBytes[offset + (i * 4)] << 24) |
                (paddedBytes[offset + (i * 4) + 1] << 16) |
                (paddedBytes[offset + (i * 4) + 2] << 8) |
                (paddedBytes[offset + (i * 4) + 3])
            ) >>> 0
        }
        let [a, b, c, d] = state
        // Main hash computation (simplified)
        for (let i = 0; i < 64; i++) {
            let f: number, g: number
            if (i < 16) {
                f = (b & c) | (~b & d)
                g = i
            } else if (i < 32) {
                f = (d & b) | (~d & c)
                g = (5 * i + 1) % 16
            } else if (i < 48) {
                f = b ^ c ^ d
                g = (3 * i + 5) % 16
            } else {
                f = c ^ (b | ~d)
                g = (7 * i) % 16
            }

            const temp = d
            d = c
            c = b
            b = toUnsigned32(b + rotateLeft(toUnsigned32(a + f + 0xD76AA478 + words[g]), 7))
            a = temp
        }
        // Update the state
        state[0] = toUnsigned32(state[0] + a)
        state[1] = toUnsigned32(state[1] + b)
        state[2] = toUnsigned32(state[2] + c)
        state[3] = toUnsigned32(state[3] + d)
    }
    return state.map(num => num.toString(16).padStart(8, '0')).join('')
}

export const UtilServices = {
    storeEvent,
    sendSMS,
    generateOTP,
    addOTP,
    getOTP,
    genQuery,
    iprsGetToken,
    getToken,
    setToken,
    unsetToken,
    iprsQuery,
    partnerNoQuery,
    singleSpaced,
    extractMiddleNames,
    hasher
}