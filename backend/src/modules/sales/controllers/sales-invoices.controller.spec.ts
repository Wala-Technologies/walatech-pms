import { Test, TestingModule } from '@nestjs/testing';
import { SalesInvoicesController } from './sales-invoices.controller';
import { SalesInvoicesService } from '../services/sales-invoices.service';
import { CreateSalesInvoiceDto } from '../dto/create-sales-invoice.dto';
import { UpdateSalesInvoiceDto } from '../dto/update-sales-invoice.dto';
import { SalesInvoice, SalesInvoiceStatus } from '../../../entities/sales-invoice.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SalesInvoicesController', () => {
  let controller: SalesInvoicesController;
  let service: SalesInvoicesService;

  const mockSalesInvoicesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    submit: jest.fn(),
    cancel: jest.fn(),
    getSummaryReport: jest.fn(),
  };

  const mockRequest = {
    user: {
      userId: 'user-123',
      tenant_id: 'tenant-123',
    },
  };

  const mockSalesInvoice: SalesInvoice = {
    id: 'invoice-123',
    name: 'SI-2024-001',
    customer_id: 'customer-123',
    customer_name: 'Test Customer',
    department_id: 'dept-123',
    posting_date: new Date('2024-01-15'),
    posting_time: '10:00:00',
    set_posting_time: false,
    due_date: new Date('2024-02-15'),
    currency: 'USD',
    conversion_rate: 1,
    selling_price_list: 'Standard Selling',
    po_no: 'PO-001',
    po_date: new Date('2024-01-10'),
    terms: 'Net 30',
    status: SalesInvoiceStatus.DRAFT,
    is_pos: false,
    update_stock: false,
    remarks: 'Test remarks',
    docstatus: 0,
    total_qty: 10,
    base_total: 1000,
    base_net_total: 1000,
    total: 1000,
    net_total: 1000,
    total_taxes_and_charges: 100,
    base_total_taxes_and_charges: 100,
    discount_amount: 50,
    base_discount_amount: 50,
    grand_total: 1050,
    base_grand_total: 1050,
    outstanding_amount: 1050,
    tenant_id: 'tenant-123',
    created_by: 'user-123',
    modified_by: 'user-123',
    created_at: new Date(),
    updated_at: new Date(),
    items: [],
    customer: null,
    department: null,
  };

  const mockCreateDto: CreateSalesInvoiceDto = {
    customer_id: 'customer-123',
    department_id: 'dept-123',
    customer_name: 'Test Customer',
    posting_date: '2024-01-15',
    posting_time: '10:00:00',
    set_posting_time: false,
    due_date: '2024-02-15',
    currency: 'USD',
    conversion_rate: 1,
    selling_price_list: 'Standard Selling',
    po_no: 'PO-001',
    po_date: '2024-01-10',
    terms: 'Net 30',
    status: SalesInvoiceStatus.DRAFT,
    is_pos: false,
    update_stock: false,
    remarks: 'Test remarks',
    items: [
      {
        item_code: 'ITEM001',
        item_name: 'Test Item',
        description: 'Test Description',
        qty: 10,
        rate: 100,
        amount: 1000,
        uom: 'Nos',
        stock_uom: 'Nos',
        conversion_factor: 1,
        warehouse: 'Main Store',
      },
    ],
  };

  const mockUpdateDto: UpdateSalesInvoiceDto = {
    posting_date: '2024-01-16',
    due_date: '2024-02-16',
    remarks: 'Updated remarks',
    items: [
      {
        item_code: 'ITEM001',
        item_name: 'Test Item',
        description: 'Test Description',
        qty: 15,
        rate: 100,
        amount: 1500,
        uom: 'Nos',
        stock_uom: 'Nos',
        conversion_factor: 1,
        warehouse: 'Main Store',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesInvoicesController],
      providers: [
        {
          provide: SalesInvoicesService,
          useValue: mockSalesInvoicesService,
        },
      ],
    }).compile();

    controller = module.get<SalesInvoicesController>(SalesInvoicesController);
    service = await module.resolve<SalesInvoicesService>(SalesInvoicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a sales invoice successfully', async () => {
      mockSalesInvoicesService.create.mockResolvedValue(mockSalesInvoice);

      const result = await controller.create(mockCreateDto, mockRequest);

      expect(result).toEqual(mockSalesInvoice);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateDto,
        mockRequest.user.tenant_id,
        mockRequest.user.userId,
      );
    });

    it('should handle customer not found error', async () => {
      mockSalesInvoicesService.create.mockRejectedValue(
        new NotFoundException('Customer not found'),
      );

      await expect(controller.create(mockCreateDto, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle bad request error', async () => {
      mockSalesInvoicesService.create.mockRejectedValue(
        new BadRequestException('Items not found'),
      );

      await expect(controller.create(mockCreateDto, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated sales invoices', async () => {
      const mockResult = {
        data: [mockSalesInvoice],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockSalesInvoicesService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(
        1,
        10,
        SalesInvoiceStatus.DRAFT,
        'customer-123',
        mockRequest,
      );

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(
        mockRequest.user.tenant_id,
        mockRequest.user.userId,
        1,
        10,
        SalesInvoiceStatus.DRAFT,
        'customer-123',
      );
    });

    it('should return sales invoices with default pagination', async () => {
      const mockResult = {
        data: [mockSalesInvoice],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockSalesInvoicesService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        mockRequest,
      );

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(
        mockRequest.user.tenant_id,
        mockRequest.user.userId,
        1,
        10,
        undefined,
        undefined,
      );
    });
  });

  describe('findOne', () => {
    it('should return a sales invoice by id', async () => {
      mockSalesInvoicesService.findOne.mockResolvedValue(mockSalesInvoice);

      const result = await controller.findOne('invoice-123', mockRequest);

      expect(result).toEqual(mockSalesInvoice);
      expect(service.findOne).toHaveBeenCalledWith(
        'invoice-123',
        mockRequest.user.tenant_id,
        mockRequest.user.userId,
      );
    });

    it('should handle sales invoice not found', async () => {
      mockSalesInvoicesService.findOne.mockRejectedValue(
        new NotFoundException('Sales Invoice not found'),
      );

      await expect(controller.findOne('invalid-id', mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a sales invoice successfully', async () => {
      const updatedInvoice = { ...mockSalesInvoice, remarks: 'Updated remarks' };
      mockSalesInvoicesService.update.mockResolvedValue(updatedInvoice);

      const result = await controller.update('invoice-123', mockUpdateDto, mockRequest);

      expect(result).toEqual(updatedInvoice);
      expect(service.update).toHaveBeenCalledWith(
        'invoice-123',
        mockUpdateDto,
        mockRequest.user.tenant_id,
        mockRequest.user.userId,
      );
    });

    it('should handle sales invoice not found during update', async () => {
      mockSalesInvoicesService.update.mockRejectedValue(
        new NotFoundException('Sales Invoice not found'),
      );

      await expect(
        controller.update('invalid-id', mockUpdateDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle bad request during update', async () => {
      mockSalesInvoicesService.update.mockRejectedValue(
        new BadRequestException('Only draft invoices can be updated'),
      );

      await expect(
        controller.update('invoice-123', mockUpdateDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a sales invoice successfully', async () => {
      mockSalesInvoicesService.remove.mockResolvedValue(undefined);

      await controller.remove('invoice-123', mockRequest);

      expect(service.remove).toHaveBeenCalledWith(
        'invoice-123',
        mockRequest.user.tenant_id,
        mockRequest.user.userId,
      );
    });

    it('should handle sales invoice not found during removal', async () => {
      mockSalesInvoicesService.remove.mockRejectedValue(
        new NotFoundException('Sales Invoice not found'),
      );

      await expect(controller.remove('invalid-id', mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle bad request during removal', async () => {
      mockSalesInvoicesService.remove.mockRejectedValue(
        new BadRequestException('Only draft invoices can be deleted'),
      );

      await expect(controller.remove('invoice-123', mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('submit', () => {
    it('should submit a sales invoice successfully', async () => {
      const submittedInvoice = {
        ...mockSalesInvoice,
        status: SalesInvoiceStatus.SUBMITTED,
        docstatus: 1,
      };
      mockSalesInvoicesService.submit.mockResolvedValue(submittedInvoice);

      const result = await controller.submit('invoice-123', mockRequest);

      expect(result).toEqual(submittedInvoice);
      expect(service.submit).toHaveBeenCalledWith(
        'invoice-123',
        mockRequest.user.tenant_id,
        mockRequest.user.userId,
      );
    });

    it('should handle sales invoice not found during submit', async () => {
      mockSalesInvoicesService.submit.mockRejectedValue(
        new NotFoundException('Sales Invoice not found'),
      );

      await expect(controller.submit('invalid-id', mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle bad request during submit', async () => {
      mockSalesInvoicesService.submit.mockRejectedValue(
        new BadRequestException('Only draft invoices can be submitted'),
      );

      await expect(controller.submit('invoice-123', mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a sales invoice successfully', async () => {
      const cancelledInvoice = {
        ...mockSalesInvoice,
        status: SalesInvoiceStatus.CANCELLED,
        docstatus: 2,
      };
      mockSalesInvoicesService.cancel.mockResolvedValue(cancelledInvoice);

      const result = await controller.cancel('invoice-123', mockRequest);

      expect(result).toEqual(cancelledInvoice);
      expect(service.cancel).toHaveBeenCalledWith(
        'invoice-123',
        mockRequest.user.tenant_id,
        mockRequest.user.userId,
      );
    });

    it('should handle sales invoice not found during cancel', async () => {
      mockSalesInvoicesService.cancel.mockRejectedValue(
        new NotFoundException('Sales Invoice not found'),
      );

      await expect(controller.cancel('invalid-id', mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle bad request during cancel', async () => {
      mockSalesInvoicesService.cancel.mockRejectedValue(
        new BadRequestException('Only submitted invoices can be cancelled'),
      );

      await expect(controller.cancel('invoice-123', mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getPrintView', () => {
    it('should return print view of a sales invoice', async () => {
      mockSalesInvoicesService.findOne.mockResolvedValue(mockSalesInvoice);

      const result = await controller.getPrintView('invoice-123', mockRequest);

      expect(result).toEqual(mockSalesInvoice);
      expect(service.findOne).toHaveBeenCalledWith(
        'invoice-123',
        mockRequest.user.tenant_id,
        mockRequest.user.userId,
      );
    });

    it('should handle sales invoice not found for print view', async () => {
      mockSalesInvoicesService.findOne.mockRejectedValue(
        new NotFoundException('Sales Invoice not found'),
      );

      await expect(controller.getPrintView('invalid-id', mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSummaryReport', () => {
    it('should return summary report', async () => {
      const mockSummary = {
        total_invoices: 10,
        total_amount: 50000,
        status_wise_count: {
          draft: 3,
          submitted: 5,
          paid: 2,
        },
        status_wise_amount: {
          draft: 15000,
          submitted: 25000,
          paid: 10000,
        },
      };

      mockSalesInvoicesService.getSummaryReport.mockResolvedValue(mockSummary);

      const result = await controller.getSummaryReport(mockRequest);

      expect(result).toEqual(mockSummary);
      expect(service.getSummaryReport).toHaveBeenCalledWith(
        mockRequest.user.tenant_id,
        mockRequest.user.userId,
      );
    });
  });
});