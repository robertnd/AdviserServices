import express from 'express'
import debug from 'debug'
import { AdviserValidationSchemas } from '../model/adviser.validation'
import { ZodIssue } from 'zod'
import { AdviserServices } from '../services/adviser.services'
import { AdviserQuery } from '../interfaces/adviser-query-dto.interface'
import { RegistrationDto } from '../dto/controllers/request/register.dto'
import config from '../../../../config'
import { ApiResponse } from '../../../../shared/dto/controllers/response/api.response'
import { UtilServices } from '../../../../shared/services/util.services'
import { getClaims } from '../../../../middleware/authMiddleware'
import { FileDataDto } from '../dto/applicant.file.dto'
import { AdviserStatus, LegalEntityType, IntermediaryType, CredentialType, RBAC } from '../../../../shared/constants'

// : Promise<void>
const log: debug.IDebugger = debug('app:advisers-controller')

// Migrates an adviser from DP to Portal
const migrateAdviser = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const validationResult = AdviserValidationSchemas.migratedAdviser.safeParse(req.body)
        if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
            const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
            res.status(400).send({ status: 'error', message: 'Validation failed', errorData: errorLists })
            return
        }

        if (validationResult.success) {
            // create reg DTO
            const adviser = req.body
            const regDto = {
                reg_type: 'migrated',
                user_id: req.body.primary_email,
                other_names: UtilServices.extractMiddleNames(req.body.full_names),
                adviser
            } as RegistrationDto

            let foundResults = await AdviserServices.checkIfAdviserExists(regDto.user_id)
            if (foundResults) {
                let message = `Adviser with details ${adviser.first_name} ${adviser.last_name} - KRA PIN ${adviser.kra_pin} already exists`
                res.status(400).send({ status: 'error', message, errorData: {} })
                return
            } else {
                const createResult = await AdviserServices.createAdviser(
                    regDto,
                    AdviserStatus.Approved,
                    LegalEntityType.person,
                    IntermediaryType.TBD,
                    CredentialType.adviser_admin,
                    RBAC.Registered
                )
                if (createResult.success) {
                    res.status(200).send({ status: 'success', data: createResult.data })
                    return
                } else {
                    res.status(500).send({ status: 'error', message: 'Migration failed', errorData: createResult.errorData })
                    return
                }
            }
        }
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Migration failed', errorData: JSON.stringify(error) })
        return
    }
}

const newAdviserApplication = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const validationResult = AdviserValidationSchemas.applicant.safeParse(req.body)
        if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
            const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
            res.status(400).send({ status: 'error', message: 'Validation failed', errorData: errorLists })
            return
        }

        if (validationResult.success) {
            // create reg DTO
            const adviser = req.body
            const regDto = {
                reg_type: 'applicant',
                user_id: req.body.primary_email,
                other_names: UtilServices.extractMiddleNames(req.body.full_names),
                adviser
            } as RegistrationDto

            let foundResults = await AdviserServices.checkIfAdviserExists(regDto.user_id)
            if (foundResults) {
                let message = `Applicant with details ${adviser.first_name} ${adviser.last_name},${adviser.primary_email} already exists`
                res.status(400).send({ status: 'error', message, errorData: {} })
                return
            } else {
                const createResult = await AdviserServices.createAdviser(
                    regDto,
                    AdviserStatus.Pending_Approval,
                    LegalEntityType.person,
                    IntermediaryType.Applicant,
                    CredentialType.adviser_applicant,
                    RBAC.Registered
                )
                if (createResult.success) {
                    res.status(200).send({ status: 'success', data: createResult.data })
                    return
                } else {
                    res.status(500).send({ status: 'error', message: 'Creation (New Applicant) failed', errorData: createResult.errorData })
                    return
                }
            }
        }
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Creation (New Applicant) failed', errorData: JSON.stringify(error) })
        return
    }
}

const newStaffUser = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const validationResult = AdviserValidationSchemas.staff.safeParse(req.body)
        if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
            const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
            res.status(400).send({ status: 'error', message: 'Validation (Staff) failed', errorData: errorLists })
            return
        }
        if (validationResult.success) {
            // create reg DTO
            const adviser = req.body
            const regDto = {
                reg_type: 'staff',
                user_id: req.body.primary_email,
                adviser_user_id: adviser.adviser_user_id,
                other_names: UtilServices.extractMiddleNames(req.body.full_names),
                adviser
            } as RegistrationDto

            let foundResults = await AdviserServices.checkIfAdviserExists(regDto.user_id)
            if (foundResults) {
                let message = `Staff with details ${adviser.first_name} ${adviser.last_name} - User ID ${adviser.user_id} already exists`
                res.status(400).send({ status: 'error', message, errorData: {} })
                return
            } else {
                const createResult = await AdviserServices.createAdviser(
                    regDto,
                    AdviserStatus.Approved,
                    LegalEntityType.person,
                    IntermediaryType.TBD,
                    CredentialType.adviser_user,
                    RBAC.Registered
                )
                if (createResult.success) {
                    res.status(200).send({ status: 'success', data: createResult.data })
                    return
                } else {
                    res.status(500).send({ status: 'error', message: 'Creation (Staff) failed', errorData: createResult.errorData })
                    return
                }
            }
        }
    } catch(error) {
        res.status(500).send({ status: 'error', message: 'Creation (Staff) failed', errorData: JSON.stringify(error) })
        return
    }
}

const saveFile = async (req: express.Request<{}, {}, FileDataDto>, res: express.Response<ApiResponse<any, any>>) => {
    const { user_id, file_desc, file_data } = req.body
    let found = await AdviserServices.checkIfAdviserExists(user_id)
    if (!found) {
        const message = `Applicant record not found`
        res.status(400).send({ status: 'error', message, errorData: message })
        return
    } else {
        const createResult = await AdviserServices.createAdviserApplicationFile(user_id, file_desc, file_data)
        if (createResult.success) {
            res.status(200).send({ status: 'success', data: {} })
            return
        } else {
            res.status(400).send({ status: 'error', message: 'Registration failed', errorData: createResult.errorData })
            return
        }
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
            const storeEvent = { user_id, event_type: 'external query', endpoint: 'simulated', direction: 'out', process: 'queryPlatformAdviser', response: result }
            var eResult = UtilServices.storeEvent(storeEvent)
            res.status(200).send({ status: 'success', data: result })
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
            res.status(400).send({ status: 'error', message: 'Request is not valid', errorData: JSON.stringify(errors) })
            return
        }
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Adviser lookup failed!', errorData: error })
        return
    }
}

const getAdviser = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const { user_id } = req.params
        if (!user_id) {
            res.status(400).send({ status: 'error', message: 'user_id not valid', })
            return
        }
        const result = await AdviserServices.getAdviser(user_id)
        if (result.success) {
            res.status(200).send({ status: 'success', data: result })
            return
        } else {
            res.status(400).send({ status: 'error', message: 'Failed', errorData: result.errorData })
            return
        }
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Error occurred', errorData: error })
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
    migrateAdviser,
    newAdviserApplication,
    newStaffUser,
    queryPlatformAdviser,
    signIn,
    getAdviser,
    saveFile
}