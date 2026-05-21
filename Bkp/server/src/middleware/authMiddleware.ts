import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Acesso negado. Token de autenticação ausente.' });
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET as string);
      (req as any).user = verified;
      next();
    } catch (error) {
        res.status(403).json({ message: 'Token de autenticação inválido.' });
    }
};