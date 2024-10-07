export class CustomError extends Error {
    constructor(message: string, public code: number, public errorData?: any) {
        super(message)
        this.name = 'CustomError'
    }
}