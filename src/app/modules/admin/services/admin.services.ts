import { QueryResult } from "pg"
import pool from "../../../config/database"
import argon2 from "argon2"
import jwt from "jsonwebtoken"
import config from "../../../config"
import { Result } from "../../../shared/dto/result"
import { AdminDto } from "../dto/controllers/admin.dto"
import { UtilServices } from "../../../shared/services/util.services"
import { AdviserServices } from "../../v1/advisers/services/adviser.services"
import { CustomError } from "../../../shared/CustomError"
import { randomBytes } from "crypto";


// ------------------------------------------------------------------------------------------------------------
// Actions (add, update, delete)
// ------------------------------------------------------------------------------------------------------------
const rootSignIn = async (secret: string): Promise<Result<string, any>> => {
    const JWT_SECRET = config.jwt_secret as string
    if (secret !== JWT_SECRET) {
        return { success: false, code: 403, errorData: 'Secret is invalid' }
    } else {
        const EXPIRES = config.jwt_validity
        const jwtOptions = { issuer: `${config.jwt_issuer}`, subject: 'root', expiresIn: EXPIRES, }
        const token = jwt.sign({ id: 'root', role: 'root' }, JWT_SECRET, jwtOptions)
        return { success: true, code: 200, data: token }
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
            return { success: true, code: 200, data: token }
        } else {
            return { success: false, code: 403, message: 'password is invalid', errorData: 'password is invalid' }
        }
    } else {
        return result
    }
}

const createAdmin = async (adminDto: AdminDto): Promise<Result<any, any>> => {
    try {
        const digest = await argon2.hash(adminDto.password)
        const insertAdviser = `INSERT INTO admins (user_id, email, mobile_no, digest, status)
                                 VALUES ( $1, $2, $3, $4, $5) RETURNING *`
        await pool.query(insertAdviser, [adminDto.user_id, adminDto.email, adminDto.mobile_no, digest, "Pending"])
        return {
            success: true,
            code: 200,
            data: { user_id: adminDto.user_id, email: adminDto.email, mobile_no: adminDto.mobile_no }
        }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while creating admin'
        return { success: false, code: 500, message, errorData: err }
    }
}

const checkIfAdminExists = async (user_id: string): Promise<boolean> => {
    const queryResult = await getAdminCredentials(user_id)
    return queryResult.success
}

const generateVerificationCode = async (): Promise<string> => {
    return randomBytes(32).toString("hex");
  };
  
  const saveVerificationCode = async (
    user_id: string,
    verificationCode: string
  ) => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const query = `
        UPDATE admins 
        SET verification_code = $1, 
            verification_code_expires_at = $2,
            is_verified = FALSE
        WHERE user_id = $3
        RETURNING *
      `;
    try {
      const result = await pool.query(query, [
        verificationCode,
        expiresAt.toISOString(),
        user_id,
      ]);
      if (result.rows.length > 0) {
        return { success: true };
      } else {
        return {
          success: false,
          errorData: `Admin with user_id: ${user_id} not found`,
        };
      }
    } catch (err: any) {
      console.error("Error saving verification code:", err)
      const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while saving verification code'
      return {
        success: false,
        code: 500,
        message,
        errorData: message,
      };
    }
  };
  const setAdminPassword = async (
    user_id: string,
    password: string,
    code: string
  ) => {
    try {
      const checkQuery = `
          SELECT verification_code, verification_code_expires_at
          FROM admins
          WHERE user_id = $1 AND verification_code = $2
        `;
      const checkResult = await pool.query(checkQuery, [user_id, code]);
  
      if (checkResult.rows.length === 0) {
        return {
          success: false,
          message: "Invalid or expired verification code",
        };
      }
  
      const admin = checkResult.rows[0];
  
      const now = new Date();
      if (new Date(admin.verification_code_expires_at) < now) {
        return { success: false, message: "Verification code has expired" };
      }
  
      const digest = await argon2.hash(password);
  
      const updateQuery = `
          UPDATE admins 
          SET digest = $1, 
              is_verified = TRUE, 
              verification_code = NULL,
              verification_code_expires_at = NULL,
              status = 'Active'
          WHERE user_id = $2
          RETURNING *
        `;
      const updateResult = await pool.query(updateQuery, [digest, user_id]);
  
      if (updateResult.rows.length > 0) {
        return { success: true, message: "Password has been set successfully" };
      } else {
        return { success: false, message: "Failed to set password" };
      }
    } catch (error) {
      console.error("Error setting admin password:", error);
      return {
        success: false,
        message: "An error occurred while setting the password",
      };
    }
  };

  
  const checkAdminByCode = async (
    verificationCode: string
  ): Promise<Result<any, any>> => {
    try {
      const queryAdmin = `
          SELECT * FROM admins 
          WHERE verification_code = $1 
          AND verification_code_expires_at > NOW()
        `;
      const result = await pool.query(queryAdmin, [verificationCode]);
      if (result.rows.length > 0) {
        return {
          success: true,
          code: 200,
          data: result.rows[0], // Admin found with the given verification code
        };
      } else {
        return {
          success: false,
          code: 404,
          errorData: {
            message: "Verification code not found or expired",
          }
        };
      }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while verifying admin'
      return {
        success: false,
        code: 500,
        message,
        errorData: err,
      };
    }
  };

const updateAdminStatus = async (user_id: string, status: string): Promise<Result<any, any>> => {
    try {
        const updateCreds = `UPDATE admins SET status=$1 WHERE user_id=$2 RETURNING *`
        const result = await pool.query(updateCreds, [status, user_id])
        if (result && result.rowCount && result.rowCount > 0) {
            return { success: true, code: 200, data: result.rows[0] }
        } else {
            var message = `No records with user_id = ${user_id} found`
            throw new CustomError(message, 400, message)
        }
    } catch (err) {
        var errorData = err
        var code = 500
        if (err instanceof CustomError) {
            errorData = err.errorData
            code = err.code
        }
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while updating admin status'
        return { success: false, code, message, errorData }
    }
}

const updateAdviserStatus = async (user_id: string, status: string): Promise<Result<any, any>> => {
    try {
        const updateCreds = `UPDATE credentials SET status=$1 WHERE user_id=$2 RETURNING *`
        const result = await pool.query(updateCreds, [status, user_id])
        // const created = result.rows[0]
        if (result && result.rowCount && result.rowCount > 0) {
            return { success: true, code: 200, data: result.rows[0] }
        } else {
            var message = `No records with user_id = ${user_id} found`
            throw new CustomError(message, 400, message)
        }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while updating adviser status'
        return { success: false, code: 500, message, errorData: err }
    }
}

// ------------------------------------------------------------------------------------------------------------
// Data Extraction - Lists
// ------------------------------------------------------------------------------------------------------------

const getApplicantFiles = async (user_id: string): Promise<Result<any, any>> => {
    var code = 500, errorData, message
    try {
        const query = `SELECT id, user_id, file_desc, create_date FROM applicant_filedata WHERE user_id=$1`
        const result = await pool.query(query, [user_id])
        if (result && result.rowCount && result.rowCount > 0) {
            return { success: true, code: 200, data: { total_items: result.rowCount, advisers: result.rows } }
        } else {
            code = 400
            message = `No records with user_id =${user_id} found`
            errorData = `No records with user_id =${user_id} found`
        }
    } catch (err) {
        message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing files'
        errorData = err
    }
    return {
        success: false, code, message, errorData
    }
}

const getAdvisersWithConditionAndPaging = async (
    vPage: number,
    pageSize: number,
    filexp: string,
    filval: string,
): Promise<Result<any, any>> => {

    const page = vPage || 1;
    const page_size = pageSize
    const offset = (page - 1) * page_size;
    var code, errorData, message
    try {
        const queryAdvisers = `SELECT * FROM all_advisers WHERE ${filexp}=$1 LIMIT $2 OFFSET $3`
        const result = await pool.query(queryAdvisers, [filval, page_size, offset])
        if (result && result.rowCount && result.rowCount > 0) {
            return {
                success: true,
                code: 200,
                data: { page, page_size, total_items: result.rowCount, advisers: result.rows }
            }
        } else {
            code = 400
            message = `No records with ${filexp}=${filval} found`
            errorData = `No records with ${filexp}=${filval} found`
        }
    } catch (err) {
        code = 500
        errorData = err
        message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing advisers'
    }
    return {
        success: false, code, message, errorData
    }
}

const getAdvisersWithNotConditionAndPaging = async (
    vPage: number,
    pageSize: number,
    filexp: string,
    filval: string,
): Promise<Result<any, any>> => {

    const page = vPage || 1;
    const page_size = pageSize
    const offset = (page - 1) * page_size;
    var code, errorData, message
    try {
        const queryAdvisers = `SELECT * FROM all_advisers WHERE ${filexp}!=$1 LIMIT $2 OFFSET $3`
        const result = await pool.query(queryAdvisers, [filval, page_size, offset])
        if (result && result.rowCount && result.rowCount > 0) {
            return {
                success: true,
                code: 200,
                data: { page, page_size, total_items: result.rowCount, advisers: result.rows }
            }
        } else {
            code = 404
            message = `No records with ${filexp}=${filval} found`
            errorData = `No records with ${filexp}=${filval} found`
        }
    } catch (err) {
        code = 500
        errorData = err
        message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing advisers'
    }
    return {
        success: false, code, message, errorData
    }
}

const getAdvisersWithCondition = async (filexp: string, filval: string,): Promise<Result<any, any>> => {
    try {
        const queryAdvisers = `SELECT * FROM all_advisers WHERE ${filexp}=$1`
        const result = await pool.query(queryAdvisers, [filval])
        return { success: true, code: 200, data: { total_items: result.rowCount, advisers: result.rows } }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing advisers'
        return { success: false, code: 500, message, errorData: err }
    }
}

const getAdvisersWithNotCondition = async (filexp: string, filval: string,): Promise<Result<any, any>> => {
    try {
        const queryAdvisers = `SELECT * FROM all_advisers WHERE ${filexp}!=$1`
        const result = await pool.query(queryAdvisers, [filval])
        return { success: true, code: 200, data: { total_items: result.rowCount, advisers: result.rows } }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing advisers'
        return { success: false, code: 500, message, errorData: err }
    }
}

const getAdvisersWithPaging = async (vPage: number, pageSize: number): Promise<Result<any, any>> => {

    const page = vPage || 1;
    const page_size = pageSize
    const offset = (page - 1) * page_size;

    try {
        const queryAdvisers = `SELECT * FROM all_advisers LIMIT $1 OFFSET $2`
        const result: QueryResult<any> = await pool.query(queryAdvisers, [page_size, offset])
        return {
            success: true,
            code: 200,
            data: {
                page,
                page_size,
                total_items: result.rowCount,
                advisers: result.rows
            }
        }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing advisers'
        return {
            success: false,
            code: 500,
            message,
            errorData: err
        }
    }
}

const getAdvisers = async (): Promise<Result<any, any>> => {
    try {
        const queryAdvisers = `SELECT * FROM all_advisers`
        const result: QueryResult<any> = await pool.query(queryAdvisers)
        return { success: true, code: 200, data: { total_items: result.rowCount, advisers: result.rows } }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing advisers'
        return { success: false, code: 500, message, errorData: err }
    }
}

const getEventsWithConditionAndPaging = async (vPage: number, pageSize: number, filexp: string, filval: string): Promise<Result<any, any>> => {
    const page = vPage || 1;
    const page_size = pageSize
    const offset = (page - 1) * page_size;
    try {
        const queryEvents = `SELECT * FROM event WHERE ${filexp}=$1 LIMIT $2 OFFSET $3`
        const result = await pool.query(queryEvents, [filval, page_size, offset])
        return {
            success: true,
            code: 200,
            data: { page, page_size, total_items: result.rowCount, events: result.rows }
        }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing events'
        return { success: false, code: 500, message, errorData: err }
    }
}

const getEventsWithCondition = async (filexp: string, filval: string): Promise<Result<any, any>> => {
    try {
        const queryEvents = `SELECT * FROM event WHERE ${filexp}=$1`
        const result = await pool.query(queryEvents, [filval])
        return {
            success: true, code: 200, data: { total_items: result.rowCount, events: result.rows }
        }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing events'
        return { success: false, code: 500, message, errorData: err }
    }
}

const getEventsWithPaging = async (vPage: number, pageSize: number): Promise<Result<any, any>> => {
    const page = vPage || 1;
    const page_size = pageSize
    const offset = (page - 1) * page_size;
    try {
        const queryEvents = `SELECT * FROM event LIMIT $1 OFFSET $2`
        const result: QueryResult<any> = await pool.query(queryEvents, [page_size, offset])
        return {
            success: true,
            code: 200,
            data: { page, page_size, total_items: result.rowCount, events: result.rows }
        }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing events'
        return { success: false, code: 500, message, errorData: err }
    }
}

const getEvents = async (): Promise<Result<any, any>> => {
    try {
        const queryEvents = `SELECT * FROM event`
        const result: QueryResult<any> = await pool.query(queryEvents)
        return {
            success: true,
            code: 200,
            data: { total_items: result.rowCount, events: result.rows }
        }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing events'
        return { success: false, code: 500, message, errorData: err }
    }
}

const getAdminsWithConditionAndPaging = async (
    vPage: number,
    pageSize: number,
    filexp: string,
    filval: string): Promise<Result<any, any>> => {

    const page = vPage || 1;
    const page_size = pageSize
    const offset = (page - 1) * page_size;
    try {
        const queryAdmins = `SELECT id, user_id, email, status, create_date FROM admins WHERE ${filexp}=$1 LIMIT $2 OFFSET $3`
        const result = await pool.query(queryAdmins, [filval, page_size, offset])
        if (result && result.rowCount && result.rowCount > 0) {
            return {
                success: true,
                code: 200,
                data: { page, page_size, total_items: result.rowCount, admins: result.rows }
            }
        } else {
            var message = `No records with ${filexp} = ${filval} was found`
            throw new CustomError(message, 400, message)
        }
    } catch (err) {
        var errorData = err
        var code = 500
        if (err instanceof CustomError) {
            code = err.code
            errorData = err.errorData
        }
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing admins'
        return { success: false, code, message, errorData }
    }
}

const getAdminsWithCondition = async (filexp: string, filval: string): Promise<Result<any, any>> => {
    try {
        const queryAdmins = `SELECT id, user_id, email, status, create_date FROM admins WHERE ${filexp}=$1`
        const result = await pool.query(queryAdmins, [filval])
        if (result && result.rowCount && result.rowCount > 0) {
            return { success: true, code: 200, data: { total_items: result.rowCount, admins: result.rows } }
        } else {
            var message = `No records with ${filexp} = ${filval} was found`
            throw new CustomError(message, 400, message)
        }
    } catch (err) {
        var errorData = err
        var code = 500
        if (err instanceof CustomError) {
            code = err.code
            errorData = err.errorData
        }
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing admins'
        return { success: false, code, message, errorData }
    }
}

const getAdminsWithPaging = async (vPage: number, pageSize: number): Promise<Result<any, any>> => {
    const page = vPage || 1;
    const page_size = pageSize
    const offset = (page - 1) * page_size;
    try {
        const queryAdmins = `SELECT id, user_id, email, status, create_date FROM admins LIMIT $1 OFFSET $2`
        const result = await pool.query(queryAdmins, [page_size, offset])
        return {
            success: true,
            code: 200,
            data: { page, page_size, total_items: result.rowCount, admins: result.rows }
        }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing admins'
        return { success: false, code: 500, message, errorData: err }
    }
}

const getAdmins = async (): Promise<Result<any, any>> => {
    try {
        const queryAdmins = `SELECT id, user_id, email, status, create_date FROM admins`
        const result = await pool.query(queryAdmins)
        return {
            success: true,
            code: 200,
            data: { total_items: result.rowCount, admins: result.rows }
        }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing admins'
        return { success: false, code: 500, message, errorData: err }
    }
}

// ------------------------------------------------------------------------------------------------------------
// Data Extraction - Entities
// ------------------------------------------------------------------------------------------------------------

const getFile = async (file_id: number): Promise<Result<any, any>> => {
    var code = 500, errorData, message
    try {
        const query = `SELECT file_data FROM applicant_filedata WHERE id=$1`
        const result = await pool.query(query, [ file_id ])
        if (result && result.rowCount && result.rowCount > 0) {
            return { success: true, code: 200, data: result.rows[0] }
        } else {
            code = 400
            message = `No file with id =${file_id} found`
            errorData = `No file with id =${file_id} found`
        }
    } catch (err) {
        errorData = err
        message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'Error getting file data'
    }
    return { success: false, code, message, errorData }
}

const getAdviser = async (user_id: string): Promise<Result<any, any>> => {

    AdviserServices.search

    try {
        const queryAdviser = `SELECT * FROM all_advisers WHERE user_id=$1`
        const result: QueryResult<any> = await pool.query(queryAdviser, [user_id])
        if (result.rows.length > 0) {
            return {
                success: true,
                code: 200,
                data: result.rows[0]
            }
        } else {
            return {
                success: false,
                code: 404,
                message: `Adviser with user-id: ${user_id} not found`,
                errorData: `Adviser with user-id: ${user_id} not found`
            }
        }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An error occurred while processing admins'
        return { success: false, code: 500, message, errorData: err }
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
            return { success: true, code: 200, data: result.rows[0] }
        } else {
            return { success: false, 
                code: 404, 
                message: `Event with id: ${event_id} not found`, 
                errorData: `Event with id: ${event_id} not found` 
            }
        }
    } catch (err) {
        const message = err && typeof err == 'object' && 'message' in err 
            ? `${err.message}`
            : 'An getting event'
        return { success: false, code: 500, message, errorData: err }
    }
}

const getAdminCredentials = async (user_id: string): Promise<Result<any, any>> => {
    const queryResult = await UtilServices.genQuery('admins', 'user_id', user_id)
    return queryResult
}

export const AdminServices = {
    rootSignIn,
    adminSignIn,
    checkIfAdminExists,

    createAdmin,
    updateAdminStatus,
    updateAdviserStatus,
    generateVerificationCode,
    saveVerificationCode,
    setAdminPassword,
    checkAdminByCode,

    getApplicantFiles,
    getAdvisersWithConditionAndPaging,
    getAdvisersWithNotConditionAndPaging,
    getAdvisersWithCondition,
    getAdvisersWithNotCondition,
    getAdvisersWithPaging,
    getAdvisers,
    getEventsWithConditionAndPaging,
    getEventsWithCondition,
    getEventsWithPaging,
    getEvents,
    getAdminsWithConditionAndPaging,
    getAdminsWithCondition,
    getAdminsWithPaging,
    getAdmins,

    getFile,
    getAdviser,
    getEvent,
    getAdminCredentials
}