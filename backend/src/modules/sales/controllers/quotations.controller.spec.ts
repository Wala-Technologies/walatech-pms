import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from '../services/quotations.service';
import { CreateQuotationDto } from '../services/quotations.service';
import { Quotation } from '../../../entities/quotation.entity';

describe('QuotationsController', () => {
  let controller: QuotationsController;
  let quotationsService: jest.Mocked<QuotationsService>;

  const mockUser = {
    user_id: 'user-1',
    tenant_id: 'tenant-1',
    id: 'user-1',
  };

  const mockQuotation: Quotation = {
    id: 'quotation-1',
    name: 'QTN-2024-001',
    party_name: 'customer-1',
    customer_name: 'Test Customer',
    transaction_date: new Date('2024-01-01'),
    valid_till: new Date('2024-01-31'),
    status: 'Draft',
    grand_total: 1000,
    letter_head: 'Company Letterhead',
    tenant_id: 'tenant-1',
    created_by: 'user-1',
    modified_by: 'user-1',
    items: [],
  } as Quotation;

  const mockCreateQuotationDto: CreateQuotationDto = {
    party_name: 'customer-1',
    customer_name: 'Test Customer',
    transaction_date: '2024-01-01',
    valid_till: '2024-01-31',
    department_id: 'dept-1',
    items: [
      {
        item_code: 'ITEM001',
        item_name: 'Test Item',
        qty: 2,
        rate: 500,
        discount_percentage: 10,
      },
    ],
  };

  const mockQuotationsList = {
    data: [
      mockQuotation,
      {
        ...mockQuotation,
        id: 'quotation-2',
        name: 'QTN-2024-002',
        status: 'Submitted',
        grand_total: 1500,
      },
      {
        ...mockQuotation,
        id: 'quotation-3',
        name: 'QTN-2024-003',
        status: 'Cancelled',
        grand_total: 800,
      },
    ],
    total: 3,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuotationsController],
      providers: [
        {
          provide: QuotationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            submit: jest.fn(),
            cancel: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<QuotationsController>(QuotationsController);
    quotationsService = module.get(QuotationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new quotation', async () => {
      quotationsService.create.mockResolvedValue(mockQuotation);

      const result = await controller.create(mockCreateQuotationDto, mockUser);

      expect(quotationsService.create).toHaveBeenCalledWith(
        mockCreateQuotationDto,
        mockUser.tenant_id,
        mockUser.user_id,
      );
      expect(result).toEqual(mockQuotation);
    });

    it('should handle service errors during creation', async () => {
      const error = new Error('Customer not found');
      quotationsService.create.mockRejectedValue(error);

      await expect(
        controller.create(mockCreateQuotationDto, mockUser),
      ).rejects.toThrow(error);

      expect(quotationsService.create).toHaveBeenCalledWith(
        mockCreateQuotationDto,
        mockUser.tenant_id,
        mockUser.user_id,
      );
    });
  });

  describe('findAll', () => {
    it('should return all quotations with default pagination', async () => {
      quotationsService.findAll.mockResolvedValue(mockQuotationsList);

      const result = await controller.findAll(undefined, undefined, mockUser);

      expect(quotationsService.findAll).toHaveBeenCalledWith(
        mockUser.tenant_id,
        1,
        10,
      );
      expect(result).toEqual(mockQuotationsList);
    });

    it('should return all quotations with custom pagination', async () => {
      const page = 2;
      const limit = 20;
      quotationsService.findAll.mockResolvedValue(mockQuotationsList);

      const result = await controller.findAll(page, limit, mockUser);

      expect(quotationsService.findAll).toHaveBeenCalledWith(
        mockUser.tenant_id,
        page,
        limit,
      );
      expect(result).toEqual(mockQuotationsList);
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database error');
      quotationsService.findAll.mockRejectedValue(error);

      await expect(
        controller.findAll(1, 10, mockUser),
      ).rejects.toThrow(error);

      expect(quotationsService.findAll).toHaveBeenCalledWith(
        mockUser.tenant_id,
        1,
        10,
      );
    });
  });

  describe('findOne', () => {
    it('should return a quotation by ID', async () => {
      const quotationId = 'quotation-1';
      quotationsService.findOne.mockResolvedValue(mockQuotation);

      const result = await controller.findOne(quotationId, mockUser);

      expect(quotationsService.findOne).toHaveBeenCalledWith(
        quotationId,
        mockUser.tenant_id,
        mockUser.user_id,
      );
      expect(result).toEqual(mockQuotation);
    });

    it('should handle service errors during findOne', async () => {
      const quotationId = 'non-existent';
      const error = new Error('Quotation not found');
      quotationsService.findOne.mockRejectedValue(error);

      await expect(
        controller.findOne(quotationId, mockUser),
      ).rejects.toThrow(error);

      expect(quotationsService.findOne).toHaveBeenCalledWith(
        quotationId,
        mockUser.tenant_id,
        mockUser.user_id,
      );
    });
  });

  describe('update', () => {
    it('should update a quotation', async () => {
      const quotationId = 'quotation-1';
      const updateDto = { customer_name: 'Updated Customer' };
      const updatedQuotation = { ...mockQuotation, customer_name: 'Updated Customer' };
      
      quotationsService.update.mockResolvedValue(updatedQuotation);

      const result = await controller.update(quotationId, updateDto, mockUser);

      expect(quotationsService.update).toHaveBeenCalledWith(
        quotationId,
        updateDto,
        mockUser.tenant_id,
        mockUser.user_id,
      );
      expect(result).toEqual(updatedQuotation);
    });

    it('should handle service errors during update', async () => {
      const quotationId = 'quotation-1';
      const updateDto = { customer_name: 'Updated Customer' };
      const error = new Error('Cannot update submitted quotation');
      quotationsService.update.mockRejectedValue(error);

      await expect(
        controller.update(quotationId, updateDto, mockUser),
      ).rejects.toThrow(error);

      expect(quotationsService.update).toHaveBeenCalledWith(
        quotationId,
        updateDto,
        mockUser.tenant_id,
        mockUser.user_id,
      );
    });
  });

  describe('remove', () => {
    it('should delete a quotation', async () => {
      const quotationId = 'quotation-1';
      quotationsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(quotationId, mockUser);

      expect(quotationsService.remove).toHaveBeenCalledWith(
        quotationId,
        mockUser.tenant_id,
        mockUser.id,
      );
      expect(result).toBeUndefined();
    });

    it('should handle service errors during remove', async () => {
      const quotationId = 'quotation-1';
      const error = new Error('Cannot delete submitted quotation');
      quotationsService.remove.mockRejectedValue(error);

      await expect(
        controller.remove(quotationId, mockUser),
      ).rejects.toThrow(error);

      expect(quotationsService.remove).toHaveBeenCalledWith(
        quotationId,
        mockUser.tenant_id,
        mockUser.id,
      );
    });
  });

  describe('submit', () => {
    it('should submit a quotation', async () => {
      const quotationId = 'quotation-1';
      const submittedQuotation = { ...mockQuotation, status: 'Submitted' };
      quotationsService.submit.mockResolvedValue(submittedQuotation);

      const result = await controller.submit(quotationId, mockUser);

      expect(quotationsService.submit).toHaveBeenCalledWith(
        quotationId,
        mockUser.tenant_id,
        mockUser.user_id,
      );
      expect(result).toEqual(submittedQuotation);
    });

    it('should handle service errors during submit', async () => {
      const quotationId = 'quotation-1';
      const error = new Error('Quotation is already submitted');
      quotationsService.submit.mockRejectedValue(error);

      await expect(
        controller.submit(quotationId, mockUser),
      ).rejects.toThrow(error);

      expect(quotationsService.submit).toHaveBeenCalledWith(
        quotationId,
        mockUser.tenant_id,
        mockUser.user_id,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a quotation', async () => {
      const quotationId = 'quotation-1';
      const cancelledQuotation = { ...mockQuotation, status: 'Cancelled' };
      quotationsService.cancel.mockResolvedValue(cancelledQuotation);

      const result = await controller.cancel(quotationId, mockUser);

      expect(quotationsService.cancel).toHaveBeenCalledWith(
        quotationId,
        mockUser.tenant_id,
        mockUser.user_id,
      );
      expect(result).toEqual(cancelledQuotation);
    });

    it('should handle service errors during cancel', async () => {
      const quotationId = 'quotation-1';
      const error = new Error('Cannot cancel draft quotation');
      quotationsService.cancel.mockRejectedValue(error);

      await expect(
        controller.cancel(quotationId, mockUser),
      ).rejects.toThrow(error);

      expect(quotationsService.cancel).toHaveBeenCalledWith(
        quotationId,
        mockUser.tenant_id,
        mockUser.user_id,
      );
    });
  });

  describe('getPrintView', () => {
    it('should return quotation print view', async () => {
      const quotationId = 'quotation-1';
      quotationsService.findOne.mockResolvedValue(mockQuotation);

      const result = await controller.getPrintView(quotationId, mockUser);

      expect(quotationsService.findOne).toHaveBeenCalledWith(
        quotationId,
        mockUser.tenant_id,
      );
      expect(result).toEqual({
        quotation: mockQuotation,
        print_settings: {
          title: 'Quotation',
          show_header: true,
          show_footer: true,
          letterhead: mockQuotation.letter_head,
        },
      });
    });

    it('should handle service errors during getPrintView', async () => {
      const quotationId = 'non-existent';
      const error = new Error('Quotation not found');
      quotationsService.findOne.mockRejectedValue(error);

      await expect(
        controller.getPrintView(quotationId, mockUser),
      ).rejects.toThrow(error);

      expect(quotationsService.findOne).toHaveBeenCalledWith(
        quotationId,
        mockUser.tenant_id,
      );
    });
  });

  describe('getSummary', () => {
    it('should return quotations summary without date filters', async () => {
      quotationsService.findAll.mockResolvedValue(mockQuotationsList);

      const result = await controller.getSummary(undefined, undefined, mockUser);

      expect(quotationsService.findAll).toHaveBeenCalledWith(
        mockUser.tenant_id,
        1,
        1000,
      );
      expect(result).toEqual({
        total_quotations: 3,
        draft_quotations: 1,
        submitted_quotations: 1,
        cancelled_quotations: 1,
        total_value: 3300, // 1000 + 1500 + 800
      });
    });

    it('should return quotations summary with date filters', async () => {
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      quotationsService.findAll.mockResolvedValue(mockQuotationsList);

      const result = await controller.getSummary(fromDate, toDate, mockUser);

      expect(quotationsService.findAll).toHaveBeenCalledWith(
        mockUser.tenant_id,
        1,
        1000,
      );
      expect(result).toEqual({
        total_quotations: 3,
        draft_quotations: 1,
        submitted_quotations: 1,
        cancelled_quotations: 1,
        total_value: 3300,
      });
    });

    it('should return empty summary when no quotations exist', async () => {
      const emptyList = { data: [], total: 0 };
      quotationsService.findAll.mockResolvedValue(emptyList);

      const result = await controller.getSummary(undefined, undefined, mockUser);

      expect(quotationsService.findAll).toHaveBeenCalledWith(
        mockUser.tenant_id,
        1,
        1000,
      );
      expect(result).toEqual({
        total_quotations: 0,
        draft_quotations: 0,
        submitted_quotations: 0,
        cancelled_quotations: 0,
        total_value: 0,
      });
    });

    it('should handle service errors during getSummary', async () => {
      const error = new Error('Database error');
      quotationsService.findAll.mockRejectedValue(error);

      await expect(
        controller.getSummary(undefined, undefined, mockUser),
      ).rejects.toThrow(error);

      expect(quotationsService.findAll).toHaveBeenCalledWith(
        mockUser.tenant_id,
        1,
        1000,
      );
    });
  });
});