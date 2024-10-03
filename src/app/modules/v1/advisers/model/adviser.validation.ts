import { z } from 'zod'

// const nonBlank = z.string().transform((t) => t?.trim()).pipe( z.string().min(1, 'Required') )
const nonBlank = (data: string) => data.trim() !== ''

const migratedAdviser = z.object({
    city: z.string({
        required_error: "city is required",
        invalid_type_error: "city must be string",
    }).refine(nonBlank, { message: "city cannot be blank" }),
    country: z.string({
        required_error: "country required",
        invalid_type_error: "country must be string",
    }).refine(nonBlank, { message: "country cannot be blank" }),
    date_of_birth: z.string({
        required_error: "date_of_birth required",
        invalid_type_error: "date_of_birth must be string",
    }).refine(nonBlank, { message: "date_of_birth cannot be blank" }),
    full_names: z.string({
        required_error: "full_names required",
        invalid_type_error: "full_names must be string",
    }).refine(nonBlank, { message: "full_names cannot be blank" }),
    id_number: z.string({
        required_error: "id_number required",
        invalid_type_error: "id_number must be string",
    }).refine(nonBlank, { message: "id_number cannot be blank" }),
    id_type: z.string({
        required_error: "id_type required",
        invalid_type_error: "id_type must be string",
    }).refine(nonBlank, { message: "id_type cannot be blank" }),
    partner_number: z.string({
        required_error: "partner_number required",
        invalid_type_error: "partner_number must be string",
    }).refine(nonBlank, { message: "partner_number cannot be blank" }),
    intermediary_type: z.string({
        required_error: "intermediary_type required",
        invalid_type_error: "intermediary_type must be string",
    }).refine(nonBlank, { message: "status cannot be blank" }),
    kra_pin: z.string({
        required_error: "kra_pin required",
        invalid_type_error: "kra_pin must be string",
    }).refine(nonBlank, { message: "kra_pin cannot be blank" }),
    account_no: z.string({
        required_error: "account_no required",
        invalid_type_error: "account_no must be string",
    }).refine(nonBlank, { message: "status cannot be blank" }),
    primary_address: z.string({
        required_error: "primary_address required",
        invalid_type_error: "primary_address must be string",
    }).refine(nonBlank, { message: "account_no cannot be blank" }),
    primary_email: z.string({
        required_error: "primary_email required",
        invalid_type_error: "primary_email must be string",
    }).refine(nonBlank, { message: "primary_email cannot be blank" }),
    mobile_no: z.string({
        required_error: "mobile_no required",
        invalid_type_error: "mobile_no must be string",
    }).refine(nonBlank, { message: "mobile_no cannot be blank" })
    // legal_entity_type: z.enum(['person', 'non-person']) 
})

const staff = z.object({
    adviser_user_id: z.string({
        required_error: "adviser_user_id is required",
        invalid_type_error: "adviser_user_id must be string",
    }).refine(nonBlank, { message: "adviser_user_id cannot be blank" }),
    id_number: z.string({
        required_error: "id_number is required",
        invalid_type_error: "id_number must be string",
    }).refine(nonBlank, { message: "id_number cannot be blank" }),
    id_type: z.string({
        required_error: "id_type is required",
        invalid_type_error: "id_type must be string",
    }).refine(nonBlank, { message: "id_type cannot be blank" }),
    primary_email: z.string().email(),
    mobile_no: z.string({
        required_error: "mobile_no is required",
        invalid_type_error: "mobile_no must be string",
    }).refine(nonBlank, { message: "mobile_no cannot be blank" }),
    date_of_birth: z.string({
        required_error: "date_of_birth is required",
        invalid_type_error: "date_of_birth must be string",
    }).refine(nonBlank, { message: "date_of_birth cannot be blank" }),
    first_name: z.string({
        required_error: "first_name is required",
        invalid_type_error: "first_name must be string",
    }).refine(nonBlank, { message: "first_name cannot be blank" }),
    last_name: z.string({
        required_error: "last_name is required",
        invalid_type_error: "last_name must be string",
    }).refine(nonBlank, { message: "last_name cannot be blank" }),
    gender: z.string({
        required_error: "gender is required",
        invalid_type_error: "gender must be string",
    }).refine(nonBlank, { message: "gender cannot be blank" })
})

const signIn =  z.object({
    user_id: z.string({
        required_error: "user_id required",
        invalid_type_error: "user_id must be string"
    }).refine(nonBlank, { message: "user_id cannot be blank" }),
    password: z.string({
        required_error: "password required",
        invalid_type_error: "password must be string"
    }).refine(nonBlank, { message: "password cannot be blank" })
})

const adviserCreateCreds =  z.object({
    user_id: z.string({
        required_error: "user_id required",
        invalid_type_error: "user_id must be string"
    }).refine(nonBlank, { message: "user_id cannot be blank" }),
    password: z.string({
        required_error: "password required",
        invalid_type_error: "password must be string"
    }).refine(nonBlank, { message: "password cannot be blank" }),
    otp: z.string({
        required_error: "otp required",
        invalid_type_error: "otp must be string"
    }).refine(nonBlank, { message: "otp cannot be blank" })
})

const applicant = z.object({
    first_name: z.string({
        required_error: "first_name is required",
        invalid_type_error: "first_name must be string",
    }).refine(nonBlank, { message: "first_name cannot be blank" }),
    last_name: z.string({
        required_error: "last_name is required",
        invalid_type_error: "last_name must be string",
    }).refine(nonBlank, { message: "last_name cannot be blank" }),
    gender: z.enum(['Male', 'Female']),
    date_of_birth: z.string({
        required_error: "date_of_birth is required",
        invalid_type_error: "date_of_birth must be string",
    }).refine(nonBlank, { message: "date_of_birth cannot be blank" }),
    id_number: z.string({
        required_error: "id_number is required",
        invalid_type_error: "id_number must be string",
    }).refine(nonBlank, { message: "id_number cannot be blank" }),
    id_type: z.enum(['National ID', 'Passport', 'Alien ID']),
    kra_pin: z.string({
        required_error: "kra_pin is required",
        invalid_type_error: "kra_pin must be string",
    }).refine(nonBlank, { message: "kra_pin cannot be blank" }),
    mobile_no: z.string({
        required_error: "mobile_no is required",
        invalid_type_error: "mobile_no must be string",
    }).refine(nonBlank, { message: "mobile_no cannot be blank" }),
    primary_email: z.string().email(),
    country: z.string({
        required_error: "country is required",
        invalid_type_error: "country must be string",
    }).refine(nonBlank, { message: "country cannot be blank" }),
    primary_address: z.string({
        required_error: "primary_address required",
        invalid_type_error: "primary_address must be string",
    }).refine(nonBlank, { message: "primary_address cannot be blank" }),
    city: z.string({
        required_error: "city required",
        invalid_type_error: "city must be string",
    }).refine(nonBlank, { message: "city cannot be blank" }),
    
    // legal_entity_type: z.enum(['person', 'non-person']) 
})

export const AdviserValidationSchemas = { 
    migratedAdviser,
    applicant,
    staff,
    adviserCreateCreds,
    signIn
 }

