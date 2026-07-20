import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { CreateTimeEntryDto } from '../dto/create-time-entry.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // Invoices
  async createInvoice(createInvoiceDto: CreateInvoiceDto, userId: string) {
    const invoice = await this.prisma.invoice.create({
      data: {
        ...createInvoiceDto,
        createdBy: userId,
      },
    });

    return invoice;
  }

  async getInvoices(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          payments: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura bulunamadı');
    }

    return invoice;
  }

  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura bulunamadı');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...updateInvoiceDto,
        updatedBy: userId,
      },
    });

    return updated;
  }

  // Payments
  async addPayment(invoiceId: string, createPaymentDto: CreatePaymentDto, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura bulunamadı');
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        ...createPaymentDto,
        createdBy: userId,
      },
    });

    // Update invoice status if fully paid
    const totalPaid = await this.prisma.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true },
    });

    if (totalPaid._sum.amount && totalPaid._sum.amount >= invoice.amount) {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID', paidDate: new Date() },
      });
    }

    return payment;
  }

  // Expenses
  async createExpense(createExpenseDto: CreateExpenseDto, userId: string) {
    const expense = await this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        createdBy: userId,
      },
    });

    return expense;
  }

  async getExpenses(page: number = 1, limit: number = 10, category?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) {
      where.category = category;
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: expenses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Time Entries
  async createTimeEntry(createTimeEntryDto: CreateTimeEntryDto, userId: string) {
    const timeEntry = await this.prisma.timeEntry.create({
      data: {
        ...createTimeEntryDto,
        userId,
        createdBy: userId,
      },
    });

    return timeEntry;
  }

  async getTimeEntries(page: number = 1, limit: number = 10, userId?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const [timeEntries, total] = await Promise.all([
      this.prisma.timeEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.timeEntry.count({ where }),
    ]);

    return {
      data: timeEntries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Reports
  async getSummaryReport(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalInvoices, totalPayments, totalExpenses, totalBillable] = await Promise.all([
      this.prisma.invoice.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          createdAt: where.createdAt || {},
        },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.timeEntry.aggregate({
        where: {
          ...where,
          billable: true,
        },
        _sum: { hours: true },
      }),
    ]);

    const totalInvoiced = totalInvoices._sum.amount ? Number(totalInvoices._sum.amount) : 0;
    const totalCollected = totalPayments._sum.amount ? Number(totalPayments._sum.amount) : 0;
    const totalExpensesAmount = totalExpenses._sum.amount ? Number(totalExpenses._sum.amount) : 0;
    const totalBillableHours = totalBillable._sum.hours ? Number(totalBillable._sum.hours) : 0;

    return {
      totalInvoiced,
      totalCollected,
      totalExpenses: totalExpensesAmount,
      totalBillableHours,
      netProfit: totalCollected - totalExpensesAmount,
    };
  }
}
