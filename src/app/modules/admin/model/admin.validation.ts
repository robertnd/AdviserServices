import { z } from 'zod'

const nonBlank = (data: string) => data.trim() !== ''
const positiveInteger = (value: string) => /^[1-9]\d*$/.test(value)
const literalActiveInactive = (data: string) => data.toLowerCase() !== 'active' && data.toLowerCase() != 'inactive'

const rootSignIn = z.object({
    secret: z.string({
        required_error: "secret required",
        invalid_type_error: "secret must be string"
    }).refine(nonBlank, { message: "secret cannot be blank" })
})

const adminSignIn = z.object({
    user_id: z.string({
        required_error: "user_id is required",
        invalid_type_error: "user_id must be string"
    }).refine(nonBlank, { message: "user_id cannot be blank" }),
    password: z.string({
        required_error: "password required",
        invalid_type_error: "password must be string"
    }).refine(nonBlank, { message: "password cannot be blank" })
})

const adminCreate = z.object({
    user_id: z.string({
        required_error: "user_id is required",
        invalid_type_error: "user_id must be string"
    }).refine(nonBlank, { message: "user_id cannot be blank" }),
    password: z.string({
        required_error: "password required",
        invalid_type_error: "password must be string"
    }).refine(nonBlank, { message: "password cannot be blank" }),
    email: z.string({
        required_error: "email is required",
        invalid_type_error: "email must be string"
    }).email(),
    mobile_no: z.string({
        required_error: "mobile_no required",
        invalid_type_error: "mobile_no must be string"
    }).refine(nonBlank, { message: "mobile_no cannot be blank" })
})

const adminStatusUpdate = z.object({
    user_id: z.string({
        required_error: "user_id required",
        invalid_type_error: "user_id must be string"
    }).refine(nonBlank, { message: "user_id cannot be blank" }),
    status: z.enum(['Active', 'Expired', 'Invalid', 'Must_Reset', 'Not_Set'])
})

const dpAdviserStatusUpdate = z.object({
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

const conditionCheck = z.object({
    filexp: z.string({
        required_error: "filexp required",
        invalid_type_error: "filexp must be string"
    }).regex(/^[a-zA-Z0-9_-]+$/, { message: "filexp is invalid" })
        .refine(nonBlank, { message: "filexp cannot be blank" }),
    filval: z.string({
        required_error: "filval required",
        invalid_type_error: "filval must be string"
    }).refine(nonBlank, { message: "filval cannot be blank" })
})

const pagingCheck = z.object({
    page: z.string({
        required_error: "page required",
        invalid_type_error: "page must be string"
    }).refine(nonBlank, { message: "page cannot be blank" })
        .refine(positiveInteger, { message: "page must be positive integer" }),
    page_size: z.string({
        required_error: "page_size required",
        invalid_type_error: "page_size must be string"
    }).refine(nonBlank, { message: "page_size cannot be blank" })
        .refine(positiveInteger, { message: "page_size must be positive integer" }),
})

const conditionAndPagingCheck = z.object({
    page: z.string({
        required_error: "page required",
        invalid_type_error: "page must be string"
    }).refine(nonBlank, { message: "page cannot be blank" })
        .refine(positiveInteger, { message: "page must be positive integer" }),
    page_size: z.string({
        required_error: "page_size required",
        invalid_type_error: "page_size must be string"
    }).refine(nonBlank, { message: "page_size cannot be blank" })
        .refine(positiveInteger, { message: "page_size must be positive integer" }),
    filexp: z.string({
        required_error: "filexp required",
        invalid_type_error: "filexp must be string"
    }).regex(/^[a-zA-Z0-9_-]+$/, { message: "filexp is invalid" })
        .refine(nonBlank, { message: "filexp cannot be blank" }),
    filval: z.string({
        required_error: "filval required",
        invalid_type_error: "filval must be string"
    }).refine(nonBlank, { message: "filval cannot be blank" })
})

export const AdminValidationSchemas = {
    rootSignIn,
    adminSignIn,
    adminCreate,
    adminStatusUpdate,
    dpAdviserStatusUpdate,
    conditionCheck,
    pagingCheck,
    conditionAndPagingCheck
}