import { getConnection, sql } from '../database';

export class InventoryRepository {

  static async getAlertaEstoqueBaixo() {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT TOP 5 
          P.Des_Produt AS name, 
          E.Qtd_Fisico AS stock, 
          E.Cod_Produt AS id
        FROM PRXLJ E 
        JOIN PRODU P ON E.Cod_Produt = P.Cod_Produt 
        WHERE E.Qtd_Fisico <= 10 
        ORDER BY E.Qtd_Fisico ASC
      `);

    return result.recordset;
  }

  static async getProdutosPaginados(page: number, limit: number, search: string) {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    const result = await pool.request()
      .input('search', sql.VarChar, `%${search}%`)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT
          P.Cod_Produt,
          P.Des_Produt,
          E.Qtd_Fisico,
          E.Qtd_Solici,
          COUNT(*) OVER() as TotalCount
        FROM PRODU P
        JOIN PRXLJ E ON P.Cod_Produt = E.Cod_Produt
        WHERE P.Des_Produt LIKE @search 
           OR P.Cod_Produt LIKE @search
        ORDER BY P.Des_Produt
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    return {
      data: result.recordset,
      total: result.recordset[0]?.TotalCount || 0
    };
  }

  static async getNomeEmpresa() {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`        
        SELECT 
          Des_RazSoc + ' - Loja ' + CAST(Cod_Loja AS VARCHAR) AS empresa
        FROM LOJAS
        WHERE Cod_Loja = 3
      `);

      return result.recordset[0] || { empresa: null };
      
  }
} 