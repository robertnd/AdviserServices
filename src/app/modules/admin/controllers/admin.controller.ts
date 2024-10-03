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
import { IPRSRequest } from '../../../shared/dto/external/iprs/request/iprs.req'
import { PartnerNumberRequest } from '../../../shared/dto/external/partner_mgmt/request/partner.no.req'
import { failedIprsData, okIprsQuery } from '../../../shared/dto/mocks/mock.data'

// : Promise<void>
const log: debug.IDebugger = debug('app:advisers-controller')

const rootSignIn = async (req: express.Request, res: express.Response<ApiResponse<any, any>>) => {
    const { user_id, secret, email } = req.body
    const validationResult = AdminValidationSchemas.rootSignIn.safeParse({ secret })
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
        const result = await AdminServices.rootSignIn(secret)
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
            let exists = await AdminServices.checkIfAdminExists(user_id)
            if (exists) {
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
            if (foundResults !== true) {
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
            if (foundResults !== true) {
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

const testIPRS = async (req: express.Request, res: express.Response) => {
    var fres
    try {
        const result = await UtilServices.iprsGetToken()
        fres = result || {}
    } catch (error) {
        fres = JSON.stringify(error)
    }
    res.status(200).send(fres)
}

// TODO: this is a Simulation
const queryIPRS = async (req: express.Request<{}, {}, IPRSRequest>, res: express.Response<ApiResponse<any, any>>) => {
    const data = okIprsQuery()
    const errorData = failedIprsData()
    res.status(200).send({ status: 'success', data })
    // res.status(500).send({
    //     status: 'error',
    //     message: '@Controller (Mock) - @queryIPRS/else - An error occurred',
    //     errorData
    // })
}

const queryIPRS_real = async (req: express.Request<{}, {}, IPRSRequest>, res: express.Response<ApiResponse<any, any>>) => {
    const { identification, id_type } = req.body
    var err
    try {
        const result = await UtilServices.iprsQuery(identification, id_type)
        const { success } = result
        if (success) {
            const { data } = result
            res.status(200).send({
                status: 'success',
                data
            })
        } else {
            res.status(500).send({
                status: 'error',
                message: '@Controller - @queryIPRS/else - An error occurred',
                errorData: result.errorData
            })
        }
    } catch (error) {
        err = JSON.stringify(error)
        res.status(500).send({
            status: 'error',
            message: '@Controller - @queryIPRS/catch - An error occurred',
            errorData: err
        })
    }
}

const partnerNoQuery_KE_Person = async (req: express.Request<{}, {}, PartnerNumberRequest>, res: express.Response<ApiResponse<any, any>>) => {
    res.status(200).send({
        status: 'success',
        data: {
            Code: 200,
            Status: 'success',
            partnerNumber: '1001171133'
        }
    })
}

const partnerNoQuery_KE_Person_REAL = async (req: express.Request<{}, {}, PartnerNumberRequest>, res: express.Response<ApiResponse<any, any>>) => {
    var txRequest = {
        country_id: 1,
        sourceid: 117640,
        partytypeid: 11,
        minorcount: 1,
        legalentitytype: 1,
        phonenumber_main: '0',
        phonenumber_alternate: '',
        firstname: req.body.firstname,
        middlename: req.body.middlename,
        surname: req.body.surname,
        companyname: '',
        emailaddress1: req.body.emailaddress1,
        emailaddress2: '',
        residenceordomicile_countrycode: 'KE',
        residenceordomicile_regionorcounty: 'CENTRAL',
        dateofbirth: req.body.dateofbirth,
        passport: '',
        id_type: 1,
        id_ke: 444442222,
        id_ug: '',
        id_tz: '',
        id_ss: '',
        id_rw: '',
        pin_ke: req.body.pin_ke,
        pin_ug: '',
        pin_rw: '',
        pin_ss: '',
        pin_tz: '',
        gender: 1,
        currencycode: '',
        nationality: 'KENYA',
        maritalstatus: 1,
        branchnumber: 0,
        sendmarketingmaterials: 0,
        sharekycinfointernally: 0,
        amlriskcategory: 0,
        pep: 0,
        town: '',
        companytin: '0',
        physicaladdress: '',
        paymentmethod: 807320000,
        bankaccountholder: '',
        bankaccountnumber: '',
        bankbranchcode: '',
        bankname: '',
        cellphonepankingnumber: '',
        mainagentorbroker_partnernumber: 0,
        salutation: 0,
        occupation: '',
        postaladdress: '',
        postalcode: '',
        customergroup: 807320000,
        vendorgroup: 807320006,
        usekycdetailsforresearch: 0,
        thirdpartieskycdetails: 0,
        directaccount: 0,
        pensionpersontype: 0,
        industrycode: 0,
        d365fo_company: 0
    }
    var err
    try {
        const result = await UtilServices.partnerNoQuery(txRequest)
        const { success } = result
        if (success) {
            res.status(200).send({
                status: 'success',
                data: result.data
            })
        } else {
            res.status(500).send({
                status: 'error',
                message: result.errorData.message || 'An error occurred',
                errorData: result.errorData
            })
        }
    } catch (error) {
        err = JSON.stringify(error)
        res.status(500).send({
            status: 'error',
            message: 'An error occurred',
            errorData: err ? err : 'Unknown error'
        })
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
    getAdminsWithPaging,
    testIPRS,
    queryIPRS,
    partnerNoQuery_KE_Person
}