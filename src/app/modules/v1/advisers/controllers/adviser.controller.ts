import express from 'express'
import debug from 'debug'
import { z } from 'zod'
import { AdviserValidationSchemas } from '../model/adviser.validation'
import { ZodIssue } from 'zod'
import { AdviserServices } from '../services/adviser.services'
import { RegistrationDto } from '../dto/controllers/request/register.dto'
import config from '../../../../config'
import { ApiResponse } from '../../../../shared/dto/controllers/response/api.response'
import { hasher, UtilServices } from '../../../../shared/services/util.services'
import { FileDataDto } from '../dto/applicant.file.dto'
import { AdviserStatus, LegalEntityType, IntermediaryType, CredentialType, RBAC } from '../../../../shared/constants'

// : Promise<void>
const log: debug.IDebugger = debug('app:advisers-controller')

// Migrates an adviser from DP to Portal
const migrateAdviser = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const validationResult = AdviserValidationSchemas.migratedAdviser.safeParse(req.body)
    if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
        const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
        res.status(400).send({ status: 'error', message: 'Validation failed', errorData: errorLists })
        return
    }
    // create reg DTO
    const adviser = req.body
    var password = ''
    if (typeof adviser === 'object' && 'password' in adviser) {
        password = adviser.password
    }
    const regDto = {
        reg_type: 'migrated',
        user_id: req.body.primary_email,
        other_names: UtilServices.extractMiddleNames(req.body.full_names),
        password,
        adviser
    } as RegistrationDto

    let foundResults = await AdviserServices.checkIfAdviserExists(regDto.user_id)
    if (foundResults) {
        let message = `Adviser with details ${adviser.first_name} ${adviser.last_name} - KRA PIN ${adviser.kra_pin} already exists`
        res.status(400).send({ status: 'error', message, errorData: message })
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
            res.status(createResult.code).send({
                status: 'error',
                message: createResult.message
                    ? createResult.message
                    : 'Migration failed',
                errorData: createResult.errorData
            })
            return
        }
    }
}

const newAdviserApplication = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const validationResult = AdviserValidationSchemas.applicant.safeParse(req.body)
    if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
        const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
        res.status(400).send({ status: 'error', message: 'Validation failed', errorData: errorLists })
        return
    }
    const adviser = req.body
    const { entity_kind } = adviser
    var password = ''
    if (typeof adviser === 'object' && 'password' in adviser) {
        password = adviser.password
    }
    const regDto = {
        reg_type: 'applicant',
        user_id: req.body.primary_email,
        other_names: UtilServices.extractMiddleNames(req.body.full_names),
        password,
        adviser
    } as RegistrationDto

    let foundResults = await AdviserServices.checkIfAdviserExists(regDto.user_id)
    if (foundResults) {
        let message = `Applicant with details ${adviser.first_name} ${adviser.last_name},${adviser.primary_email} already exists`
        res.status(400).send({ status: 'error', message, errorData: message })
        return
    } else {
        const createResult = await AdviserServices.createAdviser(
            regDto,
            entity_kind == 'IPRS' ? AdviserStatus.Approved : AdviserStatus.Pending_Approval,
            LegalEntityType.person,
            IntermediaryType.Applicant,
            CredentialType.adviser_applicant,
            RBAC.Registered
        )
        if (createResult.success) {
            res.status(200).send({ status: 'success', data: createResult.data })
            return
        } else {
            res.status(createResult.code).send({
                status: 'error',
                message: createResult.message
                    ? createResult.message
                    : 'Creation (New Applicant) failed',
                errorData: createResult.errorData
            })
            return
        }
    }
}

const newStaffUser = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const validationResult = AdviserValidationSchemas.staff.safeParse(req.body)
    if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
        const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
        res.status(400).send({ status: 'error', message: 'Validation (Staff) failed', errorData: errorLists })
        return
    }
    // create reg DTO
    const adviser = req.body
    var password = ''
    if (typeof adviser === 'object' && 'password' in adviser) {
        password = adviser.password
    }
    const regDto = {
        reg_type: 'staff',
        user_id: req.body.primary_email,
        adviser_user_id: adviser.adviser_user_id,
        other_names: UtilServices.extractMiddleNames(req.body.full_names),
        password,
        adviser
    } as RegistrationDto

    let foundResults = await AdviserServices.checkIfAdviserExists(regDto.user_id)
    if (foundResults) {
        let message = `Staff with details ${adviser.first_name} ${adviser.last_name} - User ID ${adviser.user_id} already exists`
        res.status(400).send({ status: 'error', message, errorData: message })
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
            res.status(createResult.code).send({
                status: 'error',
                message: createResult.message
                    ? createResult.message
                    : 'Creation (Staff) failed',
                errorData: createResult.errorData
            })
            return
        }
    }
}

const saveFile = async (req: express.Request<{}, {}, FileDataDto>, res: express.Response<ApiResponse<any, any>>) => {
    const { user_id, file_desc, file_data } = req.body

    const validationResult = AdviserValidationSchemas.saveFile.safeParse(req.body)
    if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
        const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
        res.status(400).send({ status: 'error', message: 'Validation failed', errorData: errorLists })
        return
    }

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
            res.status(createResult.code).send({ status: 'error', message: 'Registration failed', errorData: createResult.errorData })
            return
        }
    }
}

const getAdviser = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const { user_id } = req.params
    const validationResult = AdviserValidationSchemas.user_id.safeParse({ user_id })
    if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
        const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
        res.status(400).send({ status: 'error', message: 'Invalid user_id', errorData: errorLists })
        return
    }
    const result = await AdviserServices.getAdviser(user_id)
    if (result.success) {
        res.status(200).send({ status: 'success', data: result.data })
    } else {
        res.status(result.code).send({ status: 'error', message: 'Failed', errorData: result.errorData })
    }
}

const searchAdviser = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const { filexp, filval } = req.body
    const validationResult = AdviserValidationSchemas.conditionCheck.safeParse({ filexp, filval })
    if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
        const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
        res.status(400).send({ status: 'error', message: 'Invalid parameters', errorData: errorLists })
        return
    }
    const result = await UtilServices.genQuery('all_advisers', filexp, filval)
    if (result.success) {
        res.status(200).send({ status: 'success', data: result.data })
    } else {
        res.status(result.code).send({ status: 'error', message: 'Failed', errorData: result.errorData })
    }
}

const getAdviserExternal = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const { filexp, filval } = req.body
    const validationResult = AdviserValidationSchemas.conditionCheck.safeParse({ filexp, filval })
    if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
        const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
        res.status(400).send({ status: 'error', message: 'Invalid primary_email', errorData: errorLists })
        return
    }
    const result = await AdviserServices.search('advpt_intermediary_202410022003', filexp, filval)
    if (result.success) {
        res.status(200).send({ status: 'success', data: result.data })
    } else {
        res.status(result.code).send({ status: 'error', message: 'Failed', errorData: result.errorData })
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
        res.status(400).send({ status: 'error', message: 'Validation failed', errorData: errorLists })
        return
    }
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
        res.status(result.code).send({ status: 'error', message: result.message || 'Sign-in failed', errorData: result.errorData })
    }
}

const createOTP = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const { user_id, mobile_no } = req.body
    const otp = UtilServices.generateOTP()
    const digest = hasher(otp)
    UtilServices.addOTP(digest)
    const result = await UtilServices.sendSMS(mobile_no, otp)
    if (result.success) {
        res.status(200).send({
            status: 'success',
            data: {
                user_id, digest
            }
        })
    } else {
        res.status(result.code).send({
            status: 'error', message: 'Unable to send OTP', errorData: 'Unable to send OTP'
        })
    }
}

const setPassword = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const { user_id, password, otp_digest } = req.body
    const otpFound = UtilServices.getOTP(otp_digest)
    if (otpFound.success) {
        const setRes = await AdviserServices.setPassword(user_id, password)
        if (setRes.success) {
            res.status(200).send({ status: 'success', data: `Password for ${user_id} set successfully` })
        } else {
            res.status(400).send({
                status: 'error',
                message: 'Set password failed',
                errorData: setRes.errorData
            })
        }
    } else {
        res.status(400).send({
            status: 'error',
            message: 'OTP not found',
            errorData: otpFound.errorData
        })

    }
}

export const AdviserController = {
    migrateAdviser,
    newAdviserApplication,
    newStaffUser,
    signIn,
    getAdviser,
    searchAdviser,
    getAdviserExternal,
    saveFile,
    createOTP,
    setPassword
}