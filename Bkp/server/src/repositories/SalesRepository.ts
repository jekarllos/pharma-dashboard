import { getConnection, sql } from "../database";

export class SalesRepository {
  static async getResumoVendasDeHoje() {
    const pool = await getConnection();
    const result = await pool.request()
      .input('today', sql.Date, new Date())
      .query(`
        SELECT
          COUNT(Cod_Movime) as totalVendas,
          ISNULL(SUM(Val_Movime), 0) AS faturamentoDiario
        FROM MOVCB
        WHERE CAST(Dat_Emissa AS DATE) = '2025-05-01'
      `);

    return result.recordset[0];
  }

  static async getTendenciaVendasSemanais() {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT 
          FORMAT(Dat_Emissa, 'dd/MM') as data, 
          SUM(Val_Movime) as total 
        FROM MOVCB 
        WHERE CAST(Dat_Emissa AS DATE) BETWEEN '2025-04-24' AND '2025-05-01'
        GROUP BY FORMAT(Dat_Emissa, 'dd/MM'), CAST(Dat_Emissa AS DATE)
        ORDER BY CAST(Dat_Emissa AS DATE) ASC
      `);

    return result.recordset;
  }

  static async getInventarioCritico() {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT TOP 5 
        P.Cod_Produt as id,
        P.Des_Produt as name, 
        ISNULL(E.Qtd_Fisico, 0) as stock
      FROM PRXLJ E 
      JOIN PRODU P ON E.Cod_Produt = P.Cod_Produt 
      WHERE E.Qtd_Fisico <= 10 
      ORDER BY E.Qtd_Fisico ASC
    `);

    return result.recordset;
  }

  static async getVendasPorPeriodo(
    startDate: string,
    endDate: string,
    page: number,
    limit: number
  ) {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    const result = await pool.request()
      .input('startDate', sql.VarChar(10), startDate)
      .input('endDate', sql.VarChar(10), endDate)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT
          M.Cod_Movime,
          M.Num_Docume,
          M.Dat_Emissa,
          M.Val_Movime,
          COUNT(*) OVER() as TotalCount
        FROM MOVCB M
        WHERE M.Cod_Loja = 3
          AND M.Cod_ModDoc = 65
          AND M.Dat_Emissa >= CONVERT(date, @startDate, 23)
          AND M.Dat_Emissa < DATEADD(DAY, 1, CONVERT(date, @endDate, 23))
        ORDER BY M.Dat_Emissa DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    return {
      data: result.recordset,
      total: result.recordset[0]?.TotalCount || 0
    };
  }

  static async getResumoVendasPorPeriodo(startDate: string, endDate: string) {
    const pool = await getConnection();

    const result = await pool.request()
      .input('startDate', sql.VarChar(10), startDate)
      .input('endDate', sql.VarChar(10), endDate)
      .query(`
        SELECT
          COUNT(*) AS quantidadeVendas,
          ISNULL(SUM(M.Val_Movime), 0) AS valorTotal,
          ISNULL(AVG(M.Val_Movime), 0) AS ticketMedio
        FROM MOVCB M
        WHERE M.Cod_Loja = 3
          AND M.Cod_ModDoc = 65
          AND M.Dat_Emissa >= CONVERT(date, @startDate, 23)
          AND M.Dat_Emissa < DATEADD(DAY, 1, CONVERT(date, @endDate, 23))
      `);

    return result.recordset[0];
  }
}