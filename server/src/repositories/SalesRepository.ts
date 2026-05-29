import { getConnection, sql } from "../database";

export class SalesRepository {
  static async getResumoVendasDeHoje() {
    const pool = await getConnection();

    const result = await pool.request()
      .input("today", sql.Date, new Date())
      .query(`
        SELECT
          COUNT(Cod_Movime) AS totalVendas,
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
          FORMAT(Dat_Emissa, 'dd/MM') AS data,
          SUM(Val_Movime) AS total
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
        P.Cod_Produt AS id,
        P.Des_Produt AS name,
        ISNULL(E.Qtd_Fisico, 0) AS stock
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
      .input("startDate", sql.VarChar(10), startDate)
      .input("endDate", sql.VarChar(10), endDate)
      .input("offset", sql.Int, offset)
      .input("limit", sql.Int, limit)
      .query(`
        SELECT
        M.Cod_Movime AS Cod_Movime,
        M.Num_Docume AS Num_Docume,
        M.Dat_Emissa AS Dat_Emissa,
        M.Val_Movime AS Val_Movime,
        M.Sta_Movime AS status,
        COUNT(*) OVER() AS TotalCount
        FROM MOVCB M
        WHERE M.Cod_Loja = 3
          AND M.Cod_ModDoc = 65
          AND M.Dat_Emissa >= CONVERT(date, @startDate, 23)
          AND M.Dat_Emissa < DATEADD(DAY, 1, CONVERT(date, @endDate, 23))
        ORDER BY M.Dat_Regist DESC, M.Cod_Movime DESC
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
    .input("startDate", sql.VarChar(10), startDate)
    .input("endDate", sql.VarChar(10), endDate)
    .query(`
      SELECT
        -- Total de vendas AUTORIZADAS (status = 'F')
        COUNT(CASE WHEN M.Sta_Movime = 'F' THEN 1 END) AS quantidadeVendas,
        
        -- Valor total APENAS das autorizadas
        ISNULL(SUM(CASE WHEN M.Sta_Movime = 'F' THEN M.Val_Movime ELSE 0 END), 0) AS valorTotal,
        
        -- Ticket médio APENAS das autorizadas
        ISNULL(AVG(CASE WHEN M.Sta_Movime = 'F' THEN M.Val_Movime ELSE NULL END), 0) AS ticketMedio,
        
        -- Quantidade de vendas CANCELADAS (status = 'C')
        COUNT(CASE WHEN M.Sta_Movime = 'C' THEN 1 END) AS totalCanceladas
      FROM MOVCB M
      WHERE M.Cod_Loja = 3
        AND M.Cod_ModDoc = 65
        AND M.Dat_Emissa >= CONVERT(date, @startDate, 23)
        AND M.Dat_Emissa < DATEADD(DAY, 1, CONVERT(date, @endDate, 23))
    `);

  return result.recordset[0];
}

static async getAllVendasPorPeriodo(
  startDate: string,
  endDate: string
) {
  const pool = await getConnection();

  const result = await pool.request()
    .input("startDate", sql.VarChar(10), startDate)
    .input("endDate", sql.VarChar(10), endDate)
    .query(`
      SELECT
        M.Cod_Movime AS Cod_Movime,
        M.Num_Docume AS Num_Docume,
        M.Dat_Emissa AS Dat_Emissa,
        M.Val_Movime AS Val_Movime,
        M.Sta_Movime AS status
      FROM MOVCB M
      WHERE M.Cod_Loja = 3
        AND M.Cod_ModDoc = 65
        AND M.Dat_Emissa >= CONVERT(date, @startDate, 23)
        AND M.Dat_Emissa < DATEADD(DAY, 1, CONVERT(date, @endDate, 23))
      ORDER BY M.Dat_Regist DESC, M.Cod_Movime DESC
    `);

  return result.recordset;
}

static async getTendenciaVendasPorPeriodo(startDate: string, endDate: string) {
  const pool = await getConnection();

  const result = await pool.request()
    .input("startDate", sql.VarChar(10), startDate)
    .input("endDate", sql.VarChar(10), endDate)
    .query(`
      SELECT
        CONVERT(VARCHAR(10), CAST(M.Dat_Emissa AS DATE), 103) AS data,
        
        -- Quantidade de vendas autorizadas no dia
        COUNT(CASE WHEN M.Sta_Movime = 'F' THEN 1 END) AS quantidadeVendas,
        
        -- Valor total das vendas autorizadas no dia
        ISNULL(SUM(CASE WHEN M.Sta_Movime = 'F' THEN M.Val_Movime ELSE 0 END), 0) AS total
      FROM MOVCB M
      WHERE M.Cod_Loja = 3
        AND M.Cod_ModDoc = 65
        AND M.Dat_Emissa >= CONVERT(date, @startDate, 23)
        AND M.Dat_Emissa < DATEADD(DAY, 1, CONVERT(date, @endDate, 23))
      GROUP BY CAST(M.Dat_Emissa AS DATE)
      ORDER BY CAST(M.Dat_Emissa AS DATE) ASC
    `);

  return result.recordset;
}

static async getVendasCanceladasPorPeriodo(
  startDate: string,
  endDate: string,
  page: number,
  limit: number
) {
  const pool = await getConnection();
  const offset = (page - 1) * limit;

  const result = await pool.request()
    .input("startDate", sql.VarChar(10), startDate)
    .input("endDate", sql.VarChar(10), endDate)
    .input("offset", sql.Int, offset)
    .input("limit", sql.Int, limit)
    .query(`
      SELECT
        M.Cod_Movime AS Cod_Movime,
        M.Num_Docume AS Num_Docume,
        M.Dat_Emissa AS Dat_Emissa,
        M.Val_Movime AS Val_Movime,
        M.Sta_Movime AS status,
      COUNT(*) OVER() AS TotalCount
      FROM MOVCB M
      WHERE M.Cod_Loja = 3
        AND M.Cod_ModDoc = 65
        AND M.Sta_Movime = 'C'
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

static async getVendaPorId(id: number) {
  const pool = await getConnection();

  // Busca cabeçalho da venda
  const cabecalho = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT
        M.Cod_Movime AS id,
        M.Num_Docume AS nfce,
        M.Dat_Emissa AS data,
        M.Val_Movime AS valorTotal,
        M.Sta_Movime AS status,
        M.Cod_Loja AS codigoLoja,
        M.Cod_ModDoc AS modeloDocumento
      FROM MOVCB M
      WHERE M.Cod_Movime = @id
    `);

  const venda = cabecalho.recordset[0];
  
  if (!venda) return null;

  // Busca itens da venda
  const itens = await this.getItensVendaPorId(id);

  return {
    ...venda,
    itens
  };
}

static async getItensVendaPorId(id: number) {
  const pool = await getConnection();

  const result = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT 
        I.Cod_Produt AS codigoProduto,
        I.Qtd_Produt AS quantidade,
        I.Num_SeqIte AS sequencia,
        I.Prc_Unitar AS precoUnitario,
        I.Per_Descon AS percentualDesconto,
        I.Val_Descon AS valorDesconto,
        I.Val_LiqIte AS valorLiquido,
        I.Flg_Cancel AS itemCancelado,
        P.Des_Produt AS descricaoProduto
      FROM MOVIT I
      JOIN PRODU P ON I.Cod_Produt = P.Cod_Produt
      WHERE I.Cod_Movime = @id
      ORDER BY I.Num_SeqIte ASC
    `);

  return result.recordset;
}

}