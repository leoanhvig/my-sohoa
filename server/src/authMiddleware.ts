import { NextFunction, Request, Response } from 'express'
import { adminAuth } from './firebaseAdmin'

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string
    email?: string
  }
}

export async function requireFirebaseAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing authorization token.' })
    }

    const token = authorization.replace('Bearer ', '')
    const decodedToken = await adminAuth.verifyIdToken(token)

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    }

    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authorization token.' })
  }
}
