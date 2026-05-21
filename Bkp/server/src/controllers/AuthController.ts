import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Módulo nativo do Node.js
import { getConnection, sql } from '../database';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query(`
        SELECT 
          Cod_Usuari, 
          Nom_Login, 
          Snh_Hash, 
          Flg_Bloque 
        FROM USUAR 
        WHERE UPPER(Nom_Login) = UPPER(@username)
        `);

    const user = result.recordset[0];

    // Validação se o usuário existe e se não está bloqueado
    if (!user || user.Flg_Bloque === 1) {
      return res.status(401).json({ message: "Credenciais inválidas ou usuário bloqueado" });
    }

    // Gera o hash MD5 da senha informada no login pelo usuário
    const passwordHash = crypto.createHash('md5').update(password).digest('hex');

    // Validação comparando o hash gerado com o armazenado no banco (em minúsculas)
    if (user.Snh_Hash.toLowerCase() !== passwordHash.toLowerCase()) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Geração do Token JWT seguro
    const token = jwt.sign(
      { id: user.Cod_Usuari, nome: user.Nom_Login },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    );
 
    // Envio do Cookie HttpOnly seguro para o navegador
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 horas
    });

    // Retorno das informações básicas do usuário logado
    return res.json({ 
      id: user.Cod_Usuari, 
      nome: user.Nom_Login 
    });

  } catch (error) {
    console.error("Erro no processo de login:", error); 
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};
