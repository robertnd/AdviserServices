import express from 'express'
import debug from 'debug'
import { ZodIssue } from 'zod'
import config from '../../../config'
import { AdminValidationSchemas } from '../model/admin.validation'
import { ApiResponse } from '../../../shared/dto/controllers/response/api.response'
import { UtilServices } from '../../../shared/services/util.services'
import { AdminServices } from '../services/admin.services'
import { AdminDto } from '../dto/controllers/admin.dto'
import { UpdateDto } from '../../../shared/dto/update.dto'
import { AdviserServices } from '../../v1/advisers/services/adviser.services'

// : Promise<void>
const log: debug.IDebugger = debug('app:advisers-controller')

const rootSignIn = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const { user_id, secret, email } = req.body
    const validationResult = AdminValidationSchemas.rootSignIn.safeParse({ user_id, secret, email })
    if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
        const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
        const storeEvent = {
            user_id, event_type: 'root sign in', endpoint: 'admin/rootSignIn', direction: '', process: 'rootSignIn', status: 'error', result: JSON.stringify(errorLists)
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
        const result = await AdminServices.rootSignIn(user_id, secret)
        if (result.success) {
            const token = result.data || ''
            const storeEvent = {
                user_id, event_type: 'sign in', endpoint: '', direction: 'in', process: 'signIn', status: 'success', result: { status: 'success' }
            }
            var eResult = UtilServices.storeEvent(storeEvent)
            res.header("x-access-token", token)
            res.status(200).send({
                status: 'success',
                data: {
                    message: `Authenticated. Token valid for ${config.jwt_validity}`,
                    token,
                    validity: `${config.jwt_validity}`
                }
            })
        } else {
            const storeEvent = {
                user_id, event_type: 'sign in', endpoint: '', direction: 'in', process: 'signIn', status: 'error', result: JSON.stringify(result.errorData)
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

const adminSignIn = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const { user_id, password, email } = req.body
    const validationResult = AdminValidationSchemas.adminSignIn.safeParse({ user_id, password, email })
    if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
        const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
        const storeEvent = {
            user_id, event_type: 'admin sign in', endpoint: '/admin-sign-in', direction: 'in', process: 'adminSignIn', status: 'error', result: JSON.stringify(errorLists)
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
        const result = await AdminServices.adminSignIn(user_id, password)
        if (result.success) {
            const token = result.data || ''
            const storeEvent = {
                user_id: user_id, event_type: 'admin sign in', endpoint: '', direction: 'in', process: 'signIn', status: 'success', result: { status: 'success' }
            }
            var eResult = UtilServices.storeEvent(storeEvent)
            res.header("x-access-token", token)
            res.status(200).send({
                status: 'success',
                data: {
                    message: `Authenticated. Token valid for ${config.jwt_validity}`,
                    token,
                    validity: `${config.jwt_validity}`
                }
            })
        } else {
            const storeEvent = {
                user_id: user_id, event_type: 'admin sign in', endpoint: '', direction: 'in', process: 'signIn', status: 'error', result: JSON.stringify(result.errorData)
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

const createAdmin = async (req: express.Request<{}, {}, AdminDto>, res: express.Response<ApiResponse<any, any>>) => {

    try {
        const validationResult = AdminValidationSchemas.adminSignIn.safeParse(req.body)
        if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
            const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
            res.status(400).send({
                status: 'error',
                message: 'Validation failed',
                errorData: errorLists
            })
            return
        }
        if (validationResult.success) {
            // check exists
            const { user_id } = req.body
            let foundResults = await AdminServices.checkIfAdminExists(user_id)
            if (foundResults.success && foundResults.data > 0) {
                res.status(400).send({
                    status: 'error',
                    message: 'Registration failed',
                    errorData: `Admin with user_id: [ ${user_id} ] exists`
                })
                return
            }

            const result = await AdminServices.createAdmin(req.body)
            if (result.success) {
                res.status(200).send({
                    status: 'success',
                    data: result.data
                })
                return
            } else {
                res.status(500).send({
                    status: 'error',
                    message: 'Registration failed',
                    errorData: result.errorData
                })
                return
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

const updateAdminStatus = async (req: express.Request<{}, {}, UpdateDto<any>>, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const { user_id, status } = req.body
        const validationResult = AdminValidationSchemas.adminStatusUpdate.safeParse({ user_id, status })
        if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
            const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
            res.status(400).send({
                status: 'error',
                message: 'Validation failed',
                errorData: errorLists
            })
            return
        }
        if (validationResult.success) {
            let foundResults = await AdminServices.checkIfAdminExists(user_id)
            if (foundResults.success && foundResults.data == 0) {
                res.status(400).send({
                    status: 'error',
                    message: 'Update failed',
                    errorData: `Admin with user_id: [ ${user_id} ] does not exist`
                })
                return
            }
            const result = await AdminServices.updateAdminStatus(user_id, status)
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

const getAdvisersWithPaging = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const { page, limit } = req.params

        // Arggh this is very ugly
        const cfg_page_size = parseInt(config.page_size as string) || 25
        const vPage = (parseInt(page as string) || 0)
        const vLimit = (parseInt(limit as string) || 0)
        var new_limit = 0, new_page = 1
        new_page = vPage <= 0 ? 1 : vPage
        new_limit = vLimit <= 0 || vLimit >= cfg_page_size ? cfg_page_size : vLimit
        const result = await AdminServices.getAdvisersWithPaging(new_page, new_limit)
        res.status(200).send({
            status: 'success',
            data: result
        })
        return
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: 'Error occurred',
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
        const result = await AdminServices.getAdviser(user_id)
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

const updateAdviserStatus = async (req: express.Request<{}, {}, UpdateDto<any>>, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const { user_id, status } = req.body
        const validationResult = AdminValidationSchemas.adminStatusUpdate.safeParse({ user_id, status })
        if (typeof validationResult.error !== 'undefined' && validationResult.error.name === 'ZodError') {
            const errorLists = validationResult.error.issues.map((err: ZodIssue) => err.message)
            res.status(400).send({
                status: 'error',
                message: 'Validation failed',
                errorData: errorLists
            })
            return
        }
        if (validationResult.success) {
            let foundResults = await AdviserServices.checkIfAdviserExists(user_id)
            if (foundResults.success && foundResults.data == 0) {
                res.status(400).send({
                    status: 'error',
                    message: 'Update failed',
                    errorData: `Admin with user_id: [ ${user_id} ] does not exist`
                })
                return
            }

            const result = await AdminServices.updateAdviserStatus(user_id, status)
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

const getEventsWithPaging = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const { page, limit } = req.params

        // TODO: make this more general??
        const cfg_page_size = parseInt(config.page_size as string) || 25
        const vPage = (parseInt(page as string) || 0)
        const vLimit = (parseInt(limit as string) || 0)
        var new_limit = 0, new_page = 1
        new_page = vPage <= 0 ? 1 : vPage
        new_limit = vLimit <= 0 || vLimit >= cfg_page_size ? cfg_page_size : vLimit
        const result = await AdminServices.getEventsWithPaging(new_page, new_limit)
        res.status(200).send({
            status: 'success',
            data: result
        })
        return
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: 'Error occurred',
            errorData: error
        })
        return
    }

}

const getEvent = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const { event_id } = req.params
        if (!event_id) {
            res.status(400).send({
                status: 'error',
                message: 'event_id not valid',
            })
            return
        }
        const result = await AdminServices.getEvent(parseInt(event_id))
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

const getAdminsWithPaging = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    try {
        const { page, limit } = req.params

        // Arggh this is very ugly
        const cfg_page_size = parseInt(config.page_size as string) || 25
        const vPage = (parseInt(page as string) || 0)
        const vLimit = (parseInt(limit as string) || 0)
        var new_limit = 0, new_page = 1
        new_page = vPage <= 0 ? 1 : vPage
        new_limit = vLimit <= 0 || vLimit >= cfg_page_size ? cfg_page_size : vLimit
        const result = await AdminServices.getAdminsWithPaging(new_page, new_limit)
        res.status(200).send({
            status: 'success',
            data: result
        })
        return
    } catch (error) {
        res.status(500).send({
            status: 'error',
            message: 'Error occurred',
            errorData: error
        })
        return
    }

}

export const AdminController = {
    rootSignIn,
    adminSignIn,
    createAdmin,
    updateAdminStatus,
    getAdvisersWithPaging,
    getAdviser,
    updateAdviserStatus,
    getEventsWithPaging,
    getEvent,
    getAdminsWithPaging
}