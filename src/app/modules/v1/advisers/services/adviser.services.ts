import pool from "../../../../config/database"
import { RegistrationDto } from "../dto/controllers/request/register.dto"
import argon2 from "argon2"
import jwt from "jsonwebtoken"
import config from "../../../../config"
import { Result } from "../../../../shared/dto/result"
import { UtilServices } from "../../../../shared/services/util.services"
import {
  AdminStatus,
  AdviserStatus,
  CredentialStatus,
  CredentialType,
  IntermediaryType,
  LegalEntityType,
  RBAC,
} from "../../../../shared/constants"
import { CustomError } from "../../../../shared/CustomError"
import { sendEmail, sendEmailViaAPI } from "../../../admin/services/admin.emails"
import { AdminServices } from "../../../admin/services/admin.services"

// ------------------------------------------------------------------------------------------------------------
// Actions (add, update, delete)
// ------------------------------------------------------------------------------------------------------------

const createAdviser = async (
  regDto: RegistrationDto,
  adviser_status: AdviserStatus,
  legal_entity_type: LegalEntityType,
  intermediary_type: IntermediaryType,
  credential_type: CredentialType,
  rbac: RBAC
): Promise<Result<any, any>> => {
  var digest = ""
  // These 4 inserts need to happen in concert

  const client = await pool.connect()
  // TODO: this information will need to come from an external source
  // var legal_entity_type = 'person'
  try {
    await client.query("BEGIN")
    const { user_id } = regDto
    var adviser_id = -1 // canary value
    var result1, result3
    const body = regDto.adviser

    // Skip Adviser creation for staff user
    if (regDto.reg_type == "staff") {
      if (
        regDto.adviser_user_id.toLowerCase() == regDto.user_id.toLowerCase()
      ) {
        var message = `user_id ( ${regDto.adviser_user_id} ) and adviser_user_id ( ${regDto.adviser_user_id} ) have the same value`
        throw new CustomError(message, 400, message)
      }
      const searchRes = await AdviserServices.getCredentials(
        regDto.adviser_user_id
      )
      if (searchRes.success) {
        const credential = searchRes.data
        if (credential.credential_type !== "adviser_admin") {
          var message = `${regDto.adviser_user_id}: Not an adviser admin`
          throw new CustomError(message, 400, message)
        }
        adviser_id = credential.adviser_id
      } else {
        // user staff creation failed ...
        // 204 will blank the response
        throw new CustomError(
          searchRes.message || "Error processing adviser",
          searchRes.code == 204 ? 404 : 500,
          searchRes.errorData
        )
      }
    } else {
      var kraPIN, accountNo, partnerNumber, loadDate, country
      if (typeof body == "object") {
        if ("kra_pin" in body) kraPIN = body.kra_pin || ""
        if ("account_no" in body) accountNo = body.account_no || ""
        if ("partner_number" in body) partnerNumber = body.partner_number || ""
        if ("load_date" in body) loadDate = body.load_date || ""
        if ("country" in body) country = body.country || "Kenya"
      }
      const insertAdviser = `INSERT INTO adviser ( kra_pin, account_no, partner_number, intermediary_type, legal_entity_type, country, status )
                                 VALUES ( $1, $2, $3, $4, $5, $6, $7) RETURNING *`
      result1 = await client.query(insertAdviser, [
        kraPIN,
        accountNo,
        partnerNumber,
        intermediary_type,
        legal_entity_type,
        country,
        adviser_status,
      ])
      // get row id of inserted record
      adviser_id = result1.rows[0].id
    }

    const digestSource = regDto.password
      ? regDto.password
      : `${UtilServices.generateOTP()}${UtilServices.generateOTP()}`
    digest = await argon2.hash(digestSource)

    const { primary_email, mobile_no } = body
    const insertCreds = `INSERT INTO credentials ( user_id, email, mobile_no, adviser_id, digest, credential_type, status, rbac ) 
            VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 ) RETURNING *`
    //var cred_type = 'adviser-admin'
    const result2 = await client.query(insertCreds, [
      user_id,
      primary_email,
      mobile_no,
      adviser_id,
      digest,
      credential_type,
      CredentialStatus.Not_Set,
      rbac,
    ])

    if (regDto.reg_type == "staff") {
      // Skip creating contacts for staff user
    } else {
      var secondaryMobile,
        secondaryEmail,
        primaryPhone,
        secondaryPhone,
        primaryAddress,
        secondaryAddress,
        city,
        secondaryCity
      if (typeof body == "object") {
        if ("secondary_mobile" in body)
          secondaryMobile = body.secondary_mobile || ""
        if ("secondary_email" in body)
          secondaryEmail = body.secondary_email || ""
        if ("primary_phone" in body) primaryPhone = body.primary_phone || ""
        if ("secondary_phone" in body)
          secondaryPhone = body.secondary_phone || ""
        if ("primary_address" in body)
          primaryAddress = body.primary_address || ""
        if ("secondary_address" in body)
          secondaryAddress = body.secondary_address || ""
        if ("city" in body) city = body.city || ""
        if ("secondary_city" in body) secondaryCity = body.secondary_city || ""
      }
      const insertContacts = `INSERT INTO adviser_contacts ( adviser_id, mobile_no, secondary_mobile_no, primary_email, secondary_email, fixed_phone_no, secondary_fixed_phone_no, primary_address, secondary_address, city, secondary_city, country ) 
                VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`
      result3 = await client.query(insertContacts, [
        adviser_id,
        mobile_no,
        secondaryMobile,
        primary_email,
        secondaryEmail,
        primaryPhone,
        secondaryPhone,
        primaryAddress,
        secondaryAddress,
        city,
        secondaryCity,
        country,
      ])
    }

    var result4
    const { id_number, id_type, first_name, last_name, full_names, gender } =
      body
    if (legal_entity_type == LegalEntityType.person) {
      const { date_of_birth } = body
      const insertPerson = `INSERT INTO adviser_person ( adviser_id, user_id, id_number, id_type, date_of_birth, first_name, last_name, full_names, gender ) 
                VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 ) RETURNING *`
      result4 = await client.query(insertPerson, [
        adviser_id,
        user_id,
        id_number,
        id_type,
        date_of_birth,
        first_name,
        last_name,
        full_names,
        gender,
      ])
    } else {
      // TODO: Internal testing only. No biz requirements yet
      const dateOfInc = new Date(Date.now()).toISOString()
      const names = "Big Bucks Agency"
      const insertNonPerson = `INSERT INTO adviser_nonperson ( adviser_id, user_id, id_number, id_type, date_of_incorporation, names ) 
                VALUES ( $1, $2, $3, $4, $5, $6) RETURNING *`
      result4 = await client.query(insertNonPerson, [
        adviser_id,
        user_id,
        id_number,
        id_type,
        dateOfInc,
        names,
      ])
    }

    await client.query("COMMIT")

    // TODO - Send email if pending approval
    try {
      if (adviser_status == AdviserStatus.Pending_Approval) {
        const results = await AdminServices.getAdminsWithCondition(
          "status",
          AdminStatus.Active
        )
        interface emailObj {
          user_id: string
        }

        if (results.success) {
          const admins: emailObj[] = results.data.admins
          const names: string[] = admins.map((email) => email.user_id)
          const recipients = names.join(";")
          const code = await AdminServices.generateVerificationCode()
          await AdminServices.saveVerificationCode(primary_email, code)
          const setPasswordLink = `${config.client_url}/set-password/${code}`
          console.log('@createAdviser - Approval Status:', adviser_status)
          console.log(`Sending mail to: [ ${recipients} ] with ${setPasswordLink} `)
          const res = await sendEmailViaAPI(recipients, setPasswordLink)
          console.log('@createAdviser - Sending Mail Result:', JSON.stringify(res))
        } else {
          throw new CustomError(
            results.message || "Error getting admin list",
            results.code,
            results.errorData
          )
        }
      } else {
        console.log('@createAdviser - Skipping mail, Approval Status:', adviser_status)
      }
    } catch (mailError) {
      console.log(JSON.stringify(mailError))
    }

    const created = {
      adviser: result1 && result1.rows[0] ? result1.rows[0] : {},
      credentials: result2.rows[0]
        ? {
            user_id,
            email: primary_email,
            mobile_no,
            adviser_id,
            credential_type,
          }
        : {},
      contacts: result3 && result3.rows[0] ? result3.rows[0] : {},
      entity: result4.rows[0] ? result4.rows[0] : {},
    }
    return { success: true, code: 200, data: created }
  } catch (err) {
    await client.query("ROLLBACK")
    var errCode = 500
    var errorData = err
    if (err instanceof CustomError) {
      errCode = err.code
      if (err.errorData) {
        errorData = err.errorData
      }
    }
    console.log(JSON.stringify(err))
    const message =
      err && typeof err == "object" && "message" in err
        ? `${err.message}`
        : "An error occurred while creating adviser"
    return { success: false, code: errCode, message, errorData }
  } finally {
    client.release()
  }
}

const createAdviserApplicationFile = async (
  user_id: string,
  file_desc: string,
  file_data: string
): Promise<Result<any, any>> => {
  try {
    const query = `INSERT INTO applicant_filedata ( user_id, file_desc, file_data ) VALUES ( $1, $2, $3) RETURNING *`
    const result = await pool.query(query, [user_id, file_desc, file_data])
    const created = result.rows[0]
    return {
      success: true,
      code: 200,
      data: { user_id, row_id: created.id, file_desc },
    }
  } catch (err) {
    console.log(JSON.stringify(err))
    const message =
      err && typeof err == "object" && "message" in err
        ? `${err.message}`
        : "An error occurred while uploading file"
    return { success: false, code: 500, message, errorData: err }
  }
}

const setPassword = async (
  user_id: string,
  password: string
): Promise<Result<any, any>> => {
  try {
    const digest = await argon2.hash(password)
    const updateCreds = `UPDATE credentials SET digest=$1 WHERE user_id=$2 RETURNING *`
    const result = await pool.query(updateCreds, [digest, user_id])
    const updated = result.rowCount && result.rowCount > 0 ? true : false
    if (updated) {
      return { success: true, code: 200, data: result.rowCount }
    } else {
      return {
        success: false,
        code: 400,
        message: `Update failed. No matching records with id ${user_id}`,
        errorData: `Update failed. No matching records with id ${user_id}`,
      }
    }
  } catch (err) {
    const message =
      err && typeof err == "object" && "message" in err
        ? `${err.message}`
        : "An error occurred while setting password"
    return { success: false, code: 500, message, errorData: err }
  }
}

const signIn = async (
  user_id: string,
  password: string
): Promise<Result<any, any>> => {
  const profile = await AdviserServices.getProfile(user_id)
  if (profile.success) {
    let storedDigest = profile.data.credentials.digest || ""
    let valid = await argon2.verify(storedDigest, password)
    if (valid) {
      const JWT_SECRET = config.jwt_secret as string
      const EXPIRES = config.jwt_validity
      const jwtOptions = {
        issuer: `${config.jwt_issuer}`,
        subject: user_id,
        expiresIn: EXPIRES,
      }

      // shorten
      const credentials = profile.data.credentials
      const adviser = profile.data.adviser
      const user = profile.data.adviser_user

      // store all this in the token
      const adviserProfile = {
        adviser_names: adviser.names,
        adviser_id: adviser.adviser_id,
        adviser_address: `${adviser.address}, ${adviser.city}`,
        adviser_mobile_no: adviser.mobile_no,
        adviser_fixed_phone: adviser.fixed_phone,
        adviser_email: adviser.email,
        adviser_kra_pin: adviser.kra_pin,
        adviser_account_number: adviser.account_number,
        adviser_partner_number: adviser.partner_number,
        adviser_intermediary_type: adviser.intermediary_type,
      }
      const payload = {
        user_id,
        email: credentials.email,
        mobile_no: user ? user.mobile_no : adviser.mobile_no,
        names: user ? `${user.first_name} ${user.last_name}` : adviser.names,
        role: credentials.credential_type,
        adviser: adviserProfile,
      }
      // const token = jwt.sign({ id: user_id, role: 'user' }, JWT_SECRET, jwtOptions)
      const token = jwt.sign(payload, JWT_SECRET, jwtOptions)
      return {
        success: true,
        code: 200,
        data: {
          token,
          names: user ? `${user.first_name} ${user.last_name}` : adviser.names,
          email: credentials.email,
        },
      }
    } else {
      // TODO: usecase related stuff here
      // -> loginAttemptLogger( ... )
      return {
        success: false,
        code: 403,
        message: "Password is invalid",
        errorData: "Password is invalid",
      }
    }
  } else {
    // TODO: usecase related stuff here
    // -> loginAttemptLogger( ... )
    return {
      success: false,
      code: 500,
      message: "Error computing digest",
      errorData: "Error computing digest",
    }
  }
}

const getCredentials = async (user_id: string): Promise<Result<any, any>> => {
  const queryResult = await UtilServices.genQuery(
    "credentials",
    "user_id",
    user_id
  )
  return queryResult
}

const getAdviser = async (user_id: string): Promise<Result<any, any>> => {
  const queryResult = await UtilServices.genQuery(
    "all_advisers",
    "user_id",
    user_id
  )
  return queryResult
}

const search = async (
  table: string,
  filexp: string,
  filval: string
): Promise<Result<any, any>> => {
  const queryResult = await UtilServices.genQuery(table, filexp, filval)
  return queryResult
}

const checkIfAdviserExists = async (user_id: string): Promise<boolean> => {
  const adviser = await getAdviser(user_id)
  return adviser.success
}

const getProfile = async (user_id: string): Promise<Result<any, any>> => {
  const credentials = await getCredentials(user_id)
  const adviser = await getAdviser(user_id)
  if (credentials.success && adviser.success) {
    return {
      success: true,
      code: 200,
      data: { credentials: credentials.data, adviser: adviser.data },
    }
  } else {
    var errors: any = []
    if (credentials.success == false && credentials.errorData)
      errors.push[credentials.errorData]
    if (adviser.success == false && adviser.errorData)
      errors.push[adviser.errorData]
      const message = 'An error occurred loading profiles'
    return { success: false, code: 500, message, errorData: errors }
  }
}

export const AdviserServices = {
  createAdviser,
  checkIfAdviserExists,
  signIn,
  setPassword,
  getProfile,
  getCredentials,
  getAdviser,
  createAdviserApplicationFile,
  search,
}
