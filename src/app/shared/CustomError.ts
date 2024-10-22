type Jsonable = string | number | boolean | null | undefined | readonly Jsonable[] | { readonly [key: string]: Jsonable } | { toJSON(): Jsonable }

export class CustomError extends Error {
    public readonly context?: Jsonable
    public readonly cause?: Error
    public readonly code: number

    constructor(message: string, code: number, options: { cause?: Error,  context?: Jsonable } = {}) {
        const { cause, context } = options
        super(message)
        this.name = this.constructor.name
        this.code = code
        this.context = context
        this.cause = cause
    }
}

export function ensureError(value: unknown): Error {
    if (value instanceof Error) return value
    let stringified = 'Unable to serialize thrown value'
    try {
        stringified = JSON.stringify(value)
    } catch { }
    const error = new Error(`Error: ${stringified}`)
    return error
}