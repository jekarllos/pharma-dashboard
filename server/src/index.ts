import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { getConnection } from './database';
import { login } from './controllers/AuthController';
import { authenticateToken } from './middleware/authMiddleware';
import { SalesRepository } from './repositories/SalesRepository';
import { InventoryRepository } from './repositories/InventoryRepository';
import { z } from 'zod';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

const paginationSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  search: z.string().default('')
});

app.use(helmet());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

app.post('/api/auth/login', login);

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return res.json({ message: 'Logout realizado com sucesso' });
});

app.get('/api/dashboard/sales-summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const summary = await SalesRepository.getResumoVendasDeHoje();
    return res.json(summary);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar dados do banco de dados!' });
  }
});

app.get('/api/dashboard/sales-trend', authenticateToken, async (req, res) => {
  const trend = await SalesRepository.getTendenciaVendasSemanais();
  res.json(trend);
});

app.get('/api/dashboard/critical-inventory', authenticateToken, async (req, res) => {
  const lowStock = await InventoryRepository.getAlertaEstoqueBaixo();
  res.json(lowStock);
});

app.get('/api/company', authenticateToken, async (req, res) => {
  try {
    const company = await InventoryRepository.getNomeEmpresa();
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
});

app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const products = await InventoryRepository.getProdutosPaginados(page, limit, search);
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: 'Parâmetros inválidos' });
  }
});

app.get('/api/sales', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, page = '1', limit = '10' } = req.query;

    if (!startDate || !endDate) {
      return res.json({ data: [], total: 0 });
    }

    const sales = await SalesRepository.getVendasPorPeriodo(
      startDate as string,
      endDate as string,
      Math.max(1, Number(page)),
      Math.max(1, Number(limit))
    );

    res.json(sales);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
});

app.get('/api/sales/summary', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.json({
        quantidadeVendas: 0,
        valorTotal: 0,
        ticketMedio: 0
      });
    }

    const summary = await SalesRepository.getResumoVendasPorPeriodo(
      startDate as string,
      endDate as string
    );

    res.json(summary);
  } catch (error) {
    console.error('Erro ao buscar resumo de vendas por período:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de vendas' });
  }
});

app.get('/api/sales/trend', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.json([]);
    }

    const trend = await SalesRepository.getTendenciaVendasPorPeriodo(
      startDate as string,
      endDate as string
    );

    res.json(trend);
  } catch (error) {
    console.error('Erro ao buscar tendência de vendas por período:', error);
    res.status(500).json({ error: 'Erro ao buscar tendência de vendas' });
  }
});

getConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`[SERVER]: Rodando em http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Não foi possível iniciar o servidor devido a falha no banco de dados.', err);
});
