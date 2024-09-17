

export type ServiceEvent = {
    trace_id?: string
    user_id: string
    event_type: string
    endpoint: string
    direction: string
    process?: string
    step?: string
    status?: string
    request?: any
    result?: any
    response?: any
} 

