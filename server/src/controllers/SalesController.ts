import { Request, Response } from 'express';
import { SalesRepository } from '../repositories/SalesRepository';

export const getAllVendas = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: "startDate e endDate são obrigatórios" 
      });
    }

    const vendas = await SalesRepository.getAllVendasPorPeriodo(
      startDate as string,
      endDate as string
    );

    res.json(vendas);
  } catch (error) {
    console.error("Erro ao buscar todas as vendas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getVendas = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: "startDate e endDate são obrigatórios" 
      });
    }

    const vendas = await SalesRepository.getVendasPorPeriodo(
      startDate as string,
      endDate as string,
      Number(page),
      Number(limit)
    );

    res.json(vendas);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getResumoVendas = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: "startDate e endDate são obrigatórios" 
      });
    }

    const resumo = await SalesRepository.getResumoVendasPorPeriodo(
      startDate as string,
      endDate as string
    );

    res.json(resumo);
  } catch (error) {
    console.error("Erro ao buscar resumo de vendas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};