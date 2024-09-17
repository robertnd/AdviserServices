import { z } from 'zod'

const nonBlank = (data: string) => data.trim() !== ''
const literalActiveInactive = (data: string) => data.toLowerCase() !== 'active' && data.toLowerCase() != 'inactive'

const rootSignIn = z.object({
    user_id: z.string({
        required_error: "user_id is required",
        invalid_type_error: "user_id must be string",
    }).refine(nonBlank, { message: "user_id cannot be blank" }),
    secret: z.string({
        required_error: "secret required",
        invalid_type_error: "secret must be string",
    }).refine(nonBlank, { message: "secret cannot be blank" })
})

const adminSignIn = z.object({
    user_id: z.string({
        required_error: "user_id is required",
        invalid_type_error: "user_id must be string",
    }).refine(nonBlank, { message: "user_id cannot be blank" }),
    password: z.string({
        required_error: "password required",
        invalid_type_error: "password must be string",
    }).refine(nonBlank, { message: "password cannot be blank" })
})

const adminStatusUpdate =  z.object({
    user_id: z.string({
        required_error: "user_id required",
        invalid_type_error: "user_id must be string"
    }).refine(nonBlank, { message: "user_id cannot be blank" }),
    status: z.enum(['Active', 'Inactive','PasswordReset'])
})

const dpAdviserStatusUpdate =  z.object({
    user_id: z.string({
        required_error: "user_id required",
        invalid_type_error: "user_id must be string"
    }).refine(nonBlank, { message: "user_id cannot be blank" }),
    status: z.string({
        required_error: "status required",
        invalid_type_error: "status must be string"
    })
    .refine(nonBlank, { message: "status cannot be blank" })
})

export const AdminValidationSchemas = { 
    rootSignIn,
    adminSignIn,
    adminStatusUpdate,
    dpAdviserStatusUpdate
 }