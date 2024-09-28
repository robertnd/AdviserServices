import express from 'express'

export const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userRole = (req as any).decoded.role
    if( userRole !== 'admin' && userRole !== 'root'){
        return res.status(403).send({
            status: 'error', 
            message: 'You are not authorized to perform this action'
        })
    }
    next()
}

export const isRoot = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userRole = (req as any).decoded.role
    if( userRole !== 'root' ){
        return res.status(403).send({
            status: 'error', 
            message: 'You are not authorized to perform this action'
        })
    }
    next()
}
