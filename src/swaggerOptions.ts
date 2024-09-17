import { Options } from 'swagger-jsdoc'
import config from './app/config'

const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Adviser API',
            version: '1.0.0',
            description: 'Docs for Adviser API',
        },
        servers: [
            {
                url: `http://${config.serving_name}:${config.port}/api/v1`,
                description: 'Serving Address',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Adviser: {
                    type: 'object',
                    required: [
                        'city', 'country', 'date_of_birth', 'full_names', 'id_number', 'id_type', 'partner_number', 'intermediary_type', 'kra_pin', 'account_no', 'primary_address', 'primary_email', 'mobile_no'
                    ],
                    properties: {
                        account_no: { type: 'string' },
                        city: { type: 'string' },
                        country: { type: 'string' },
                        date_of_birth: { type: 'string' },
                        first_name: { type: 'string' },
                        full_names: { type: 'string' },
                        gender: { type: 'string' },
                        id_number: { type: 'string' },
                        id_type: { type: 'string' },
                        intermediary_type: { type: 'string' },
                        kra_pin: { type: 'string' },
                        last_name: { type: 'string' },
                        load_date: { type: 'string' },
                        mobile_no: { type: 'string' },
                        partner_number: { type: 'string' },
                        primary_address: { type: 'string' },
                        primary_email: { type: 'string' },
                        primary_phone: { type: 'string' },
                        secondary_address: { type: 'string' },
                        secondary_city: { type: 'string' },
                        secondary_email: { type: 'string' },
                        secondary_mobile: { type: 'string' },
                        secondary_phone: { type: 'string' }
                    }
                },
                Event: {
                    type: 'object',
                    required: [
                        'id', 'epid', 'user_id', 'create_date', 'event_type', 'endpoint', 'direction'
                    ],
                    properties: {
                        id: { type: 'number' },
                        trace_id: { type: 'string' },
                        create_date: { type: 'string' },
                        event_type: { type: 'string' },
                        endpoint: { type: 'string' },
                        direction: { type: 'string' },
                        process: { type: 'string' },
                        step: { type: 'string' },
                        status: { type: 'string' },
                    }
                },
                FullEvent: {
                    type: 'object',
                    required: [
                        'id', 'epid', 'user_id', 'create_date', 'event_type', 'endpoint', 'direction'
                    ],
                    properties: {
                        id: { type: 'number' },
                        epid: { type: 'number' },
                        trace_id: { type: 'string' },
                        create_date: { type: 'string' },
                        event_type: { type: 'string' },
                        endpoint: { type: 'string' },
                        direction: { type: 'string' },
                        process: { type: 'string' },
                        step: { type: 'string' },
                        status: { type: 'string' },
                        request: { type: 'string' },
                        result: { type: 'string' },
                        response: { type: 'string' }
                    }
                },
                AdviserQuery: {
                    type: 'object',
                    required: ['key', 'value'],
                    properties: {
                        key: { type: 'kraPin | mobileNo | idNumber' },
                        value: { type: 'string' }
                    }
                },
                SignIn: {
                    type: 'object',
                    required: ['user_id', 'password', 'email'],
                    properties: {
                        user_id: { type: 'string' },
                        password: { type: 'string' },
                        email: { type: 'string' }
                    }
                },
                CreateAdmin: {
                    type: 'object',
                    required: ['user_id', 'password', 'email'],
                    properties: {
                        user_id: { type: 'string' },
                        password: { type: 'string' },
                        email: { type: 'string' }
                    }
                },
                RootSignIn: {
                    type: 'object',
                    required: ['user_id', 'secret', 'email'],
                    properties: {
                        user_id: { type: 'string' },
                        secret: { type: 'string' },
                        email: { type: 'string' }
                    }
                },
                AdviserStatusUpdate: {
                    type: 'object',
                    required: ['user_id', 'status'],
                    properties: {
                        user_id: { type: 'string' },
                        status: { type: 'string' }
                    }
                },
                AdminStatusUpdate: {
                    type: 'object',
                    required: ['user_id', 'status'],
                    properties: {
                        user_id: { type: 'string' },
                        status: { type: 'string' }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', },
                        message: { type: 'string' },
                        data: { type: 'any' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', },
                        message: { type: 'string' },
                        errorData: { type: 'any' }
                    }
                }
            },
        }
    },
    // Path to the API docs
    apis: [
        './src/app/modules/v1/advisers/routes/adviser.routes.ts',
        './src/app/modules/admin/routes/admin.routes.ts'
    ]
}

export default swaggerOptions
