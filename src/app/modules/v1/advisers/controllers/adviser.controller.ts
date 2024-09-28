import express from 'express'
import debug from 'debug'
import { AdviserValidationSchemas } from '../model/adviser.validation'
import { ZodIssue } from 'zod'
import { AdviserServices } from '../services/adviser.services'
import { AdviserQuery } from '../interfaces/adviser-query-dto.interface'
import { RegistrationDto } from '../dto/controllers/request/register.existing.dto'
import config from '../../../../config'
import { ApiResponse } from '../../../../shared/dto/controllers/response/api.response'
import { UtilServices } from '../../../../shared/services/util.services'
import { getClaims } from '../../../../middleware/authMiddleware'

// : Promise<void>
const log: debug.IDebugger = debug('app:advisers-controller')

const registerAdviser = async (req: express.Request<{}, {}, RegistrationDto>, res: express.Response<ApiResponse<any, any>>) => {

    try {
        const validationResult = AdviserValidationSchemas.dpAdviser.safeParse(req.body.dpAdviser)
        if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
            const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
            res.status(400).send({
                status: 'error',
                message: 'Validation failed',
                errorData: errorLists
            })
            return
        }
        const { user_id, password, otp } = req.body
        const credsCheckResult = AdviserValidationSchemas.adviserCreateCreds.safeParse({ user_id, password, otp })
        if (typeof credsCheckResult.error !== 'undefined' && credsCheckResult.error.name === 'ZodError') {
            const errorLists = credsCheckResult.error.issues.map((err: ZodIssue) => err.message)
            res.status(400).send({
                status: 'error',
                message: 'Validation failed',
                errorData: errorLists
            })
            return
        }
        if (validationResult.success && credsCheckResult.success) {
            // TODO: toggle
            // const validOtp = UtilServices.getOTP(otp)
            // if (!validOtp.success) {
            //     res.status(400).send({
            //         status: 'error',
            //         message: `OTP ${otp} is not valid`
            //     })
            //     return
            // }
            // check exists
            let foundResults = await AdviserServices.checkIfAdviserExists(user_id)
            if (foundResults) {
                const createResult = await AdviserServices.setPassword(user_id, password)
                if (createResult.success) {
                    res.status(200).send({
                        status: 'success',
                        data: { action: 'Set Password' }
                    })
                    return
                } else {
                    res.status(500).send({
                        status: 'error',
                        message: 'Password reset failed',
                        errorData: createResult.errorData
                    })
                    return
                }
            } else {
                const createResult = await AdviserServices.createAdviser(req.body)
                if (createResult.success) {
                    res.status(200).send({
                        status: 'success',
                        data: createResult.data
                    })
                    return
                } else {
                    res.status(500).send({
                        status: 'error',
                        message: 'Registration failed',
                        errorData: createResult.errorData
                    })
                    return
                }
            }
        }
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: 'Registration failed',
            errorData: JSON.stringify(error)
        })
        return
    }
}

// POST: cause type restriction things
const queryPlatformAdviser = async (req: express.Request<{}, {}, AdviserQuery>, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const { key, value } = req.body
        if (key
            && value
            && (key.toUpperCase() === 'kra_pin'.toUpperCase() || key.toUpperCase() === 'mobile_no'.toUpperCase() || key.toUpperCase() === 'id_number'.toUpperCase())
        ) {
            const result = await AdviserServices.queryPlatformAdviser({ key, value })
            const user_id = getClaims(req)['sub'] || ''
            const storeEvent = {
                user_id,
                event_type: 'external query',
                endpoint: 'simulated',
                direction: 'out',
                process: 'queryPlatformAdviser',
                response: result
            }
            var eResult = UtilServices.storeEvent(storeEvent)
            res.status(200).send({
                status: 'success',
                data: result
            })
            return
        } else {
            let newKey: string = key || '__noKeyFound'
            var errors: string[] = []
            if (newKey == '__noKeyFound') {
                errors.push('[ key ] field not found. A key field with a value of either kraPin, mobileNo or idNumber is required')
            } else if (key.toUpperCase() !== 'kraPin'.toUpperCase() && key.toUpperCase() !== 'mobileNo'.toUpperCase() && key.toUpperCase() !== 'idNumber'.toUpperCase()) {
                errors.push(`Key [ ${key} ] is not valid. Must be kraPin, mobileNo or idNumber`)
            }
            if (!value) {
                errors.push('[ value ] field not found')
            }
            res.status(400).send({
                status: 'error',
                message: 'Request is not valid',
                errorData: JSON.stringify(errors)
            })
            return
        }
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: 'Adviser lookup failed!',
            errorData: error
        })
        return
    }
}

const getAdviser = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const { user_id } = req.params
        if (!user_id) {
            res.status(400).send({
                status: 'error',
                message: 'user_id not valid',
            })
            return
        }
        const result = await AdviserServices.getAdviser(user_id)
        if (result.success) {
            res.status(200).send({
                status: 'success',
                data: result
            })
            return
        } else {
            res.status(400).send({
                status: 'error',
                message: 'Failed',
                errorData: result.errorData
            })
            return
        }
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: 'Error occurred',
            errorData: error
        })
        return
    }
}


//`${config.jwt_validity_secs}s`
const signIn = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const { user_id, password, email } = req.body
    const validationResult = AdviserValidationSchemas.signIn.safeParse({ user_id, password, email })
    if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
        const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
        const storeEvent = {
            user_id: user_id, event_type: 'sign in', endpoint: '', direction: 'in', process: 'signIn', status: 'error', result: JSON.stringify(errorLists)
        }
        var eResult = UtilServices.storeEvent(storeEvent)
        res.status(400).send({
            status: 'error',
            message: 'Validation failed',
            errorData: errorLists
        })
        return
    }
    if (validationResult.success) {
        const result = await AdviserServices.signIn(user_id, password)
        if (result.success) {
            const token = result.data.token || ''
            const userPayload = {
                message: 'Login successful',
                authenticated: true,
                profileName: result.data.names,
                email: result.data.email,
                token: {
                    accessToken: token,
                    validity: `${config.jwt_validity}`
                }
            }
            res.header("x-access-token", token)
            res.status(200).send({
                status: 'success',
                data: userPayload
            })
            const storeEvent = {
                user_id: user_id, event_type: 'sign in', endpoint: '', direction: 'in', process: 'signIn', status: 'success', result: { status: 'success' }
            }
            UtilServices.storeEvent(storeEvent)
        } else {
            const storeEvent = {
                user_id: user_id, event_type: 'sign in', endpoint: '', direction: 'in', process: 'signIn', status: 'error', result: JSON.stringify(result.errorData)
            }
            var eResult = UtilServices.storeEvent(storeEvent)
            res.status(400).send({
                status: 'error',
                message: 'Sign In failed',
                errorData: result.errorData
            })
        }
    }
}

export const AdviserController = {
    registerAdviser,
    queryPlatformAdviser,
    signIn,
    getAdviser
}