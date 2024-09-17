import jwt from 'jsonwebtoken'
import config from '../config'
import { NextFunction, Request, Response } from 'express'

const JWT_SECRET = config.jwt_secret as string

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).send({ success: false, message: 'Unauthorized', errorData: 'Invalid token' })
        return
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            const { name, message } = err
            res.status(401).send({ success: false, message: `Unauthorized: ${name} - ${message || 'Unknown error'}`, errorData: `${name} - ${message || 'Unknown error'}` })
            return
        }
        (req as any).decoded = decoded
        next()
    })
}

interface JwtPayload { [key: string]: any }

export const getClaims = (req: Request) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || ''
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded
    } catch (error) {
        return {}
    }
}
