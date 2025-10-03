import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SalesWorkflowService } from './sales-workflow.service';
import { QuotationsService } from './quotations.service';
import { SalesOrdersService } from './sales-orders.service';
import { DeliveryNotesService } from './delivery-notes.service';
import { SalesInvoicesService } from './sales-invoices.service';
import { Quotation } from '../../../entities/quotation.entity';
import { SalesOrder } from '../../../entities/sales-order.entity';
import { DeliveryNote } from '../../../entities/delivery-note.entity';
import { SalesInvoice } from '../../../entities/sales-invoice.entity';

describe('SalesWorkflowService', () => {
  let service: SalesWorkflowService;
  let quotationRepository: jest.Mocked<Repository<Quotation>>;
  let salesOrderRepository: jest.Mocked<Repository<SalesOrder>>;
  let deliveryNoteRepository: jest.Mocked<Repository<DeliveryNote>>;
  let salesInvoiceRepository: jest.Mocked<Repository<SalesInvoice>>;
  let quotationsService: jest.Mocked<QuotationsService>;
  let salesOrdersService: jest.Mocked<SalesOrdersService>;
  let deliveryNotesService: jest.Mocked<DeliveryNotesService>;
  let salesInvoicesService: jest.Mocked<SalesInvoicesService>;

  const mockQuotation = {
    id: 'quotation-1',
    name: 'QTN-2024-001',
    status: 'Submitted',
    party_name: 'customer-1',
    grand_total: 1000,
    items: [
      {
        id: 'item-1',
        item_code: 'ITEM001',
        qty: 2,
        rate: 500,
        amount: 1000,
      },
    ],
  } as Quotation;

  const mockSalesOrder = {
    id: 'sales-order-1',
    name: 'SO-2024-001',
    status: 'To Deliver and Bill',
    customer_id: 'customer-1',
    grand_total: 1000,
    items: [
      {
        id: 'item-1',
        item_code: 'ITEM001',
        qty: 2,
        rate: 500,
        amount: 1000,
      },
    ],
  } as SalesOrder;

  const mockDeliveryNote = {
    id: 'delivery-note-1',
    name: 'DN-2024-001',
    status: 'To Bill',
    customer_id: 'customer-1',
    grand_total: 1000,
    items: [
      {
        id: 'item-1',
        item_code: 'ITEM001',
        qty: 2,
        rate: 500,
        amount: 1000,
      },
    ],
  } as DeliveryNote;

  const mockSalesInvoice = {
    id: 'sales-invoice-1',
    name: 'SI-2024-001',
    status: 'Submitted',
    customer_id: 'customer-1',
    grand_total: 1000,
    items: [
      {
        id: 'item-1',
        item_code: 'ITEM001',
        qty: 2,
        rate: 500,
        amount: 1000,
      },
    ],
  } as SalesInvoice;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesWorkflowService,
        {
          provide: getRepositoryToken(Quotation),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SalesOrder),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DeliveryNote),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SalesInvoice),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: QuotationsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: SalesOrdersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: DeliveryNotesService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: SalesInvoicesService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = await module.resolve<SalesWorkflowService>(SalesWorkflowService);
    quotationRepository = module.get(getRepositoryToken(Quotation));
    salesOrderRepository = module.get(getRepositoryToken(SalesOrder));
    deliveryNoteRepository = module.get(getRepositoryToken(DeliveryNote));
    salesInvoiceRepository = module.get(getRepositoryToken(SalesInvoice));
    quotationsService = module.get(QuotationsService);
    salesOrdersService = module.get(SalesOrdersService);
    deliveryNotesService = module.get(DeliveryNotesService);
    salesInvoicesService = module.get(SalesInvoicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('convertQuotationToSalesOrder', () => {
    it('should convert a submitted quotation to sales order', async () => {
      const quotationId = 'quotation-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      const additionalData = { delivery_date: '2024-12-31' };

      quotationsService.findOne.mockResolvedValue(mockQuotation);
      salesOrdersService.create.mockResolvedValue(mockSalesOrder);

      const result = await service.convertQuotationToSalesOrder(
        quotationId,
        tenantId,
        userId,
        additionalData,
      );

      expect(quotationsService.findOne).toHaveBeenCalledWith(quotationId, tenantId, userId);
      expect(salesOrdersService.create).toHaveBeenCalledWith(
        {
          customer_id: mockQuotation.party_name,
          transaction_date: expect.any(String),
          delivery_date: additionalData.delivery_date,
          items: mockQuotation.items.map(item => ({
            item_code: item.item_code,
            qty: item.qty,
            rate: item.rate,
            amount: item.amount,
          })),
        },
        tenantId,
        userId,
      );
      expect(result).toEqual(mockSalesOrder);
    });

    it('should throw BadRequestException if quotation is not submitted', async () => {
      const quotationId = 'quotation-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      const draftQuotation = { ...mockQuotation, status: 'Draft' };
      quotationsService.findOne.mockResolvedValue(draftQuotation);

      await expect(
        service.convertQuotationToSalesOrder(quotationId, tenantId, userId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.convertQuotationToSalesOrder(quotationId, tenantId, userId),
      ).rejects.toThrow('Only submitted quotations can be converted to sales orders');

      expect(salesOrdersService.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if quotation is not found', async () => {
      const quotationId = 'non-existent';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      quotationsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.convertQuotationToSalesOrder(quotationId, tenantId, userId),
      ).rejects.toThrow(NotFoundException);

      expect(salesOrdersService.create).not.toHaveBeenCalled();
    });
  });

  describe('convertSalesOrderToDeliveryNote', () => {
    it('should convert a confirmed sales order to delivery note', async () => {
      const salesOrderId = 'sales-order-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      const additionalData = { posting_date: '2024-12-31' };

      salesOrdersService.findOne.mockResolvedValue(mockSalesOrder);
      deliveryNotesService.create.mockResolvedValue(mockDeliveryNote);

      const result = await service.convertSalesOrderToDeliveryNote(
        salesOrderId,
        tenantId,
        userId,
        additionalData,
      );

      expect(salesOrdersService.findOne).toHaveBeenCalledWith(salesOrderId, tenantId);
      expect(deliveryNotesService.create).toHaveBeenCalledWith(
        {
          customer_id: mockSalesOrder.customer_id,
          posting_date: additionalData.posting_date,
          items: mockSalesOrder.items.map(item => ({
            item_code: item.item_code,
            qty: item.qty,
            rate: item.rate,
            amount: item.amount,
          })),
        },
        tenantId,
        userId,
      );
      expect(result).toEqual(mockDeliveryNote);
    });

    it('should throw BadRequestException if sales order is not confirmed', async () => {
      const salesOrderId = 'sales-order-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      const draftSalesOrder = { ...mockSalesOrder, status: 'Draft' };
      salesOrdersService.findOne.mockResolvedValue(draftSalesOrder);

      await expect(
        service.convertSalesOrderToDeliveryNote(salesOrderId, tenantId, userId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.convertSalesOrderToDeliveryNote(salesOrderId, tenantId, userId),
      ).rejects.toThrow('Only confirmed sales orders can be converted to delivery notes');

      expect(deliveryNotesService.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if sales order is not found', async () => {
      const salesOrderId = 'non-existent';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      salesOrdersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.convertSalesOrderToDeliveryNote(salesOrderId, tenantId, userId),
      ).rejects.toThrow(NotFoundException);

      expect(deliveryNotesService.create).not.toHaveBeenCalled();
    });
  });

  describe('convertDeliveryNoteToSalesInvoice', () => {
    it('should convert a submitted delivery note to sales invoice', async () => {
      const deliveryNoteId = 'delivery-note-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      const additionalData = { due_date: '2024-12-31' };

      deliveryNotesService.findOne.mockResolvedValue(mockDeliveryNote);
      salesInvoicesService.create.mockResolvedValue(mockSalesInvoice);

      const result = await service.convertDeliveryNoteToSalesInvoice(
        deliveryNoteId,
        tenantId,
        userId,
        additionalData,
      );

      expect(deliveryNotesService.findOne).toHaveBeenCalledWith(deliveryNoteId, tenantId, userId);
      expect(salesInvoicesService.create).toHaveBeenCalledWith(
        {
          customer_id: mockDeliveryNote.customer_id,
          posting_date: expect.any(String),
          due_date: additionalData.due_date,
          items: mockDeliveryNote.items.map(item => ({
            item_code: item.item_code,
            qty: item.qty,
            rate: item.rate,
            amount: item.amount,
          })),
        },
        tenantId,
        userId,
      );
      expect(result).toEqual(mockSalesInvoice);
    });

    it('should throw BadRequestException if delivery note is not submitted', async () => {
      const deliveryNoteId = 'delivery-note-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      const draftDeliveryNote = { ...mockDeliveryNote, status: 'Draft' };
      deliveryNotesService.findOne.mockResolvedValue(draftDeliveryNote);

      await expect(
        service.convertDeliveryNoteToSalesInvoice(deliveryNoteId, tenantId, userId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.convertDeliveryNoteToSalesInvoice(deliveryNoteId, tenantId, userId),
      ).rejects.toThrow('Only submitted delivery notes can be converted to sales invoices');

      expect(salesInvoicesService.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if delivery note is not found', async () => {
      const deliveryNoteId = 'non-existent';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      deliveryNotesService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.convertDeliveryNoteToSalesInvoice(deliveryNoteId, tenantId, userId),
      ).rejects.toThrow(NotFoundException);

      expect(salesInvoicesService.create).not.toHaveBeenCalled();
    });
  });

  describe('getWorkflowStatus', () => {
    it('should return workflow status for quotation document type', async () => {
      const documentId = 'quotation-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      quotationsService.findOne.mockResolvedValue(mockQuotation);
      salesOrderRepository.find.mockResolvedValue([mockSalesOrder]);

      const result = await service.getWorkflowStatus('quotation', documentId, tenantId, userId);

      expect(quotationsService.findOne).toHaveBeenCalledWith(documentId, tenantId, userId);
      expect(salesOrderRepository.find).toHaveBeenCalledWith({
        where: { customer_id: mockQuotation.party_name, tenant_id: tenantId },
        relations: ['items'],
      });
      expect(result).toEqual({
        quotation: {
          id: mockQuotation.id,
          name: mockQuotation.name,
          status: mockQuotation.status,
          grand_total: mockQuotation.grand_total,
        },
        sales_order: {
          id: mockSalesOrder.id,
          name: mockSalesOrder.name,
          status: mockSalesOrder.status,
          grand_total: mockSalesOrder.grand_total,
        },
        delivery_note: undefined,
        sales_invoice: undefined,
        workflow_stage: 'sales_order',
        can_progress: true,
        next_action: 'Create Delivery Note',
      });
    });

    it('should return workflow status for sales_order document type', async () => {
      const documentId = 'sales-order-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      salesOrdersService.findOne.mockResolvedValue(mockSalesOrder);

      const result = await service.getWorkflowStatus('sales_order', documentId, tenantId, userId);

      expect(salesOrdersService.findOne).toHaveBeenCalledWith(documentId, tenantId);
      expect(result).toEqual({
        quotation: undefined,
        sales_order: {
          id: mockSalesOrder.id,
          name: mockSalesOrder.name,
          status: mockSalesOrder.status,
          grand_total: mockSalesOrder.grand_total,
        },
        delivery_note: undefined,
        sales_invoice: undefined,
        workflow_stage: 'sales_order',
        can_progress: true,
        next_action: 'Create Delivery Note',
      });
    });

    it('should return workflow status for delivery_note document type', async () => {
      const documentId = 'delivery-note-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      deliveryNotesService.findOne.mockResolvedValue(mockDeliveryNote);

      const result = await service.getWorkflowStatus('delivery_note', documentId, tenantId, userId);

      expect(deliveryNotesService.findOne).toHaveBeenCalledWith(documentId, tenantId, userId);
      expect(result).toEqual({
        quotation: undefined,
        sales_order: undefined,
        delivery_note: {
          id: mockDeliveryNote.id,
          name: mockDeliveryNote.name,
          status: mockDeliveryNote.status,
          grand_total: mockDeliveryNote.grand_total,
        },
        sales_invoice: undefined,
        workflow_stage: 'delivery_note',
        can_progress: true,
        next_action: 'Create Sales Invoice',
      });
    });

    it('should return workflow status for sales_invoice document type', async () => {
      const documentId = 'sales-invoice-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      salesInvoicesService.findOne.mockResolvedValue(mockSalesInvoice);

      const result = await service.getWorkflowStatus('sales_invoice', documentId, tenantId, userId);

      expect(salesInvoicesService.findOne).toHaveBeenCalledWith(documentId, tenantId, userId);
      expect(result).toEqual({
        quotation: undefined,
        sales_order: undefined,
        delivery_note: undefined,
        sales_invoice: {
          id: mockSalesInvoice.id,
          name: mockSalesInvoice.name,
          status: mockSalesInvoice.status,
          grand_total: mockSalesInvoice.grand_total,
        },
        workflow_stage: 'sales_invoice',
        can_progress: true,
        next_action: 'Record Payment',
      });
    });

    it('should return completed workflow status for paid sales invoice', async () => {
      const documentId = 'sales-invoice-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      const paidSalesInvoice = { ...mockSalesInvoice, status: 'Paid' };
      salesInvoicesService.findOne.mockResolvedValue(paidSalesInvoice);

      const result = await service.getWorkflowStatus('sales_invoice', documentId, tenantId, userId);

      expect(result).toEqual({
        quotation: undefined,
        sales_order: undefined,
        delivery_note: undefined,
        sales_invoice: {
          id: paidSalesInvoice.id,
          name: paidSalesInvoice.name,
          status: paidSalesInvoice.status,
          grand_total: paidSalesInvoice.grand_total,
        },
        workflow_stage: 'completed',
        can_progress: false,
        next_action: undefined,
      });
    });

    it('should return quotation workflow status when only quotation exists', async () => {
      const documentId = 'quotation-1';
      const tenantId = 'tenant-1';
      const userId = 'user-1';

      quotationsService.findOne.mockResolvedValue(mockQuotation);
      salesOrderRepository.find.mockResolvedValue([]);

      const result = await service.getWorkflowStatus('quotation', documentId, tenantId, userId);

      expect(result).toEqual({
        quotation: {
          id: mockQuotation.id,
          name: mockQuotation.name,
          status: mockQuotation.status,
          grand_total: mockQuotation.grand_total,
        },
        sales_order: undefined,
        delivery_note: undefined,
        sales_invoice: undefined,
        workflow_stage: 'quotation',
        can_progress: true,
        next_action: 'Create Sales Order',
      });
    });
  });

  describe('getSalesPipeline', () => {
    it('should return sales pipeline overview', async () => {
      const tenantId = 'tenant-1';

      const quotations = [
        { ...mockQuotation, status: 'Draft', grand_total: 500 },
        { ...mockQuotation, id: 'quotation-2', status: 'Submitted', grand_total: 1000 },
      ];
      const salesOrders = [
        { ...mockSalesOrder, status: 'Draft', grand_total: 800 },
        { ...mockSalesOrder, id: 'sales-order-2', status: 'To Deliver and Bill', grand_total: 1200 },
      ];
      const deliveryNotes = [
        { ...mockDeliveryNote, status: 'Draft', grand_total: 600 },
        { ...mockDeliveryNote, id: 'delivery-note-2', status: 'To Bill', grand_total: 900 },
      ];
      const salesInvoices = [
        { ...mockSalesInvoice, status: 'Draft', grand_total: 700 },
        { ...mockSalesInvoice, id: 'sales-invoice-2', status: 'Submitted', grand_total: 1100 },
        { ...mockSalesInvoice, id: 'sales-invoice-3', status: 'Paid', grand_total: 1300 },
      ];

      quotationRepository.find.mockResolvedValue(quotations);
      salesOrderRepository.find.mockResolvedValue(salesOrders);
      deliveryNoteRepository.find.mockResolvedValue(deliveryNotes);
      salesInvoiceRepository.find.mockResolvedValue(salesInvoices);

      const result = await service.getSalesPipeline(tenantId);

      expect(quotationRepository.find).toHaveBeenCalledWith({ where: { tenant_id: tenantId } });
      expect(salesOrderRepository.find).toHaveBeenCalledWith({ where: { tenant_id: tenantId } });
      expect(deliveryNoteRepository.find).toHaveBeenCalledWith({ where: { tenant_id: tenantId } });
      expect(salesInvoiceRepository.find).toHaveBeenCalledWith({ where: { tenant_id: tenantId } });

      expect(result).toEqual({
        quotations: {
          total: 2,
          draft: 1,
          submitted: 1,
          total_value: 1500,
        },
        sales_orders: {
          total: 2,
          draft: 1,
          confirmed: 1,
          total_value: 2000,
        },
        delivery_notes: {
          total: 2,
          draft: 1,
          submitted: 1,
          total_value: 1500,
        },
        sales_invoices: {
          total: 3,
          draft: 1,
          submitted: 1,
          paid: 1,
          total_value: 3100,
        },
      });
    });

    it('should return empty pipeline when no documents exist', async () => {
      const tenantId = 'tenant-1';

      quotationRepository.find.mockResolvedValue([]);
      salesOrderRepository.find.mockResolvedValue([]);
      deliveryNoteRepository.find.mockResolvedValue([]);
      salesInvoiceRepository.find.mockResolvedValue([]);

      const result = await service.getSalesPipeline(tenantId);

      expect(result).toEqual({
        quotations: {
          total: 0,
          draft: 0,
          submitted: 0,
          total_value: 0,
        },
        sales_orders: {
          total: 0,
          draft: 0,
          confirmed: 0,
          total_value: 0,
        },
        delivery_notes: {
          total: 0,
          draft: 0,
          submitted: 0,
          total_value: 0,
        },
        sales_invoices: {
          total: 0,
          draft: 0,
          submitted: 0,
          paid: 0,
          total_value: 0,
        },
      });
    });
  });
});