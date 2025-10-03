import { Test, TestingModule } from '@nestjs/testing';
import { SupplierScorecardsController } from './supplier-scorecards.controller';
import { SupplierScorecardsService } from '../services/supplier-scorecards.service';
import { CreateSupplierScorecardDto } from '../dto/create-supplier-scorecard.dto';
import { UpdateSupplierScorecardDto } from '../dto/update-supplier-scorecard.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('SupplierScorecardsController', () => {
  let controller: SupplierScorecardsController;
  let service: SupplierScorecardsService;

  const mockSupplierScorecardsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySupplier: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    calculateScore: jest.fn(),
    getScorecardStats: jest.fn(),
    getSupplierPerformanceTrend: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierScorecardsController],
      providers: [
        {
          provide: SupplierScorecardsService,
          useValue: mockSupplierScorecardsService,
        },
      ],
    }).compile();

    controller = module.get<SupplierScorecardsController>(SupplierScorecardsController);
    service = module.get<SupplierScorecardsService>(SupplierScorecardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSupplierScorecardDto = {
      supplier_id: 1,
      period: '2024-Q1',
      criteria: [
        {
          name: 'Quality',
          weight: 40,
          score: 85,
        },
        {
          name: 'Delivery',
          weight: 30,
          score: 90,
        },
        {
          name: 'Price',
          weight: 30,
          score: 80,
        },
      ],
    };

    const mockScorecard = {
      id: 1,
      supplier_id: 1,
      period: '2024-Q1',
      overall_score: 85,
      standing: 'Good',
      created_at: new Date(),
      updated_at: new Date(),
      supplier: {
        id: 1,
        name: 'Test Supplier',
      },
      criteria: [
        {
          id: 1,
          name: 'Quality',
          weight: 40,
          score: 85,
        },
      ],
      periods: [
        {
          id: 1,
          period: '2024-Q1',
          score: 85,
        },
      ],
    };

    it('should create a supplier scorecard successfully', async () => {
      mockSupplierScorecardsService.create.mockResolvedValue(mockScorecard);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockScorecard);
    });

    it('should handle supplier not found error', async () => {
      mockSupplierScorecardsService.create.mockRejectedValue(
        new NotFoundException('Supplier not found'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(NotFoundException);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle existing scorecard conflict', async () => {
      mockSupplierScorecardsService.create.mockRejectedValue(
        new ConflictException('Scorecard already exists for this supplier and period'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle invalid criteria weights error', async () => {
      mockSupplierScorecardsService.create.mockRejectedValue(
        new ConflictException('Criteria weights must sum to 100%'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    const mockScorecards = {
      data: [
        {
          id: 1,
          supplier_id: 1,
          period: '2024-Q1',
          overall_score: 85,
          standing: 'Good',
          supplier: {
            id: 1,
            name: 'Test Supplier',
          },
        },
        {
          id: 2,
          supplier_id: 2,
          period: '2024-Q1',
          overall_score: 75,
          standing: 'Average',
          supplier: {
            id: 2,
            name: 'Another Supplier',
          },
        },
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('should return all scorecards with default pagination', async () => {
      mockSupplierScorecardsService.findAll.mockResolvedValue(mockScorecards);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockScorecards);
    });

    it('should return scorecards with pagination', async () => {
      const query = { page: '2', limit: '5' };
      mockSupplierScorecardsService.findAll.mockResolvedValue(mockScorecards);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockScorecards);
    });

    it('should return scorecards with search filter', async () => {
      const query = { search: 'Test' };
      mockSupplierScorecardsService.findAll.mockResolvedValue(mockScorecards);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockScorecards);
    });

    it('should return scorecards with supplier filter', async () => {
      const query = { supplier_id: '1' };
      mockSupplierScorecardsService.findAll.mockResolvedValue(mockScorecards);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockScorecards);
    });

    it('should return scorecards with period filter', async () => {
      const query = { period: '2024-Q1' };
      mockSupplierScorecardsService.findAll.mockResolvedValue(mockScorecards);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockScorecards);
    });

    it('should return scorecards with standing filter', async () => {
      const query = { standing: 'Good' };
      mockSupplierScorecardsService.findAll.mockResolvedValue(mockScorecards);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockScorecards);
    });
  });

  describe('getScorecardStats', () => {
    const mockStats = {
      total_scorecards: 10,
      by_standing: {
        Excellent: 2,
        Good: 4,
        Average: 3,
        Poor: 1,
      },
      by_period: {
        '2024-Q1': 5,
        '2024-Q2': 5,
      },
      average_score: 82.5,
      top_performers: [
        {
          supplier_id: 1,
          supplier_name: 'Top Supplier',
          score: 95,
        },
      ],
      poor_performers: [
        {
          supplier_id: 2,
          supplier_name: 'Poor Supplier',
          score: 60,
        },
      ],
    };

    it('should return scorecard statistics', async () => {
      mockSupplierScorecardsService.getScorecardStats.mockResolvedValue(mockStats);

      const result = await controller.getScorecardStats();

      expect(service.getScorecardStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('findBySupplier', () => {
    const supplierId = '1';
    const mockScorecards = [
      {
        id: 1,
        supplier_id: 1,
        period: '2024-Q1',
        overall_score: 85,
        standing: 'Good',
      },
      {
        id: 2,
        supplier_id: 1,
        period: '2024-Q2',
        overall_score: 88,
        standing: 'Good',
      },
    ];

    it('should return scorecards for a specific supplier', async () => {
      mockSupplierScorecardsService.findBySupplier.mockResolvedValue(mockScorecards);

      const result = await controller.findBySupplier(supplierId);

      expect(service.findBySupplier).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockScorecards);
    });

    it('should handle supplier not found error', async () => {
      mockSupplierScorecardsService.findBySupplier.mockRejectedValue(
        new NotFoundException('Supplier not found'),
      );

      await expect(controller.findBySupplier(supplierId)).rejects.toThrow(NotFoundException);
      expect(service.findBySupplier).toHaveBeenCalledWith(1);
    });
  });

  describe('getSupplierPerformanceTrend', () => {
    const supplierId = '1';
    const mockTrend = {
      supplier_id: 1,
      current_score: 88,
      previous_score: 85,
      trend: 'Improving',
      change_percentage: 3.53,
    };

    it('should return performance trend for a supplier', async () => {
      mockSupplierScorecardsService.getSupplierPerformanceTrend.mockResolvedValue(mockTrend);

      const result = await controller.getSupplierPerformanceTrend(supplierId);

      expect(service.getSupplierPerformanceTrend).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTrend);
    });

    it('should handle supplier not found error', async () => {
      mockSupplierScorecardsService.getSupplierPerformanceTrend.mockRejectedValue(
        new NotFoundException('Supplier not found'),
      );

      await expect(controller.getSupplierPerformanceTrend(supplierId)).rejects.toThrow(NotFoundException);
      expect(service.getSupplierPerformanceTrend).toHaveBeenCalledWith(1);
    });

    it('should handle insufficient data error', async () => {
      mockSupplierScorecardsService.getSupplierPerformanceTrend.mockRejectedValue(
        new ConflictException('Insufficient scorecard data for trend analysis'),
      );

      await expect(controller.getSupplierPerformanceTrend(supplierId)).rejects.toThrow(ConflictException);
      expect(service.getSupplierPerformanceTrend).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    const scorecardId = '1';
    const mockScorecard = {
      id: 1,
      supplier_id: 1,
      period: '2024-Q1',
      overall_score: 85,
      standing: 'Good',
      created_at: new Date(),
      updated_at: new Date(),
      supplier: {
        id: 1,
        name: 'Test Supplier',
      },
      criteria: [
        {
          id: 1,
          name: 'Quality',
          weight: 40,
          score: 85,
        },
      ],
      periods: [
        {
          id: 1,
          period: '2024-Q1',
          score: 85,
        },
      ],
    };

    it('should return a scorecard by id', async () => {
      mockSupplierScorecardsService.findOne.mockResolvedValue(mockScorecard);

      const result = await controller.findOne(scorecardId);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockScorecard);
    });

    it('should handle scorecard not found error', async () => {
      mockSupplierScorecardsService.findOne.mockRejectedValue(
        new NotFoundException('Scorecard not found'),
      );

      await expect(controller.findOne(scorecardId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('calculateScore', () => {
    const scorecardId = '1';
    const mockUpdatedScorecard = {
      id: 1,
      supplier_id: 1,
      period: '2024-Q1',
      overall_score: 87,
      standing: 'Good',
      rfq_warning: false,
      po_warning: false,
    };

    it('should calculate and update scorecard score', async () => {
      mockSupplierScorecardsService.calculateScore.mockResolvedValue(mockUpdatedScorecard);

      const result = await controller.calculateScore(scorecardId);

      expect(service.calculateScore).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUpdatedScorecard);
    });

    it('should handle scorecard not found error', async () => {
      mockSupplierScorecardsService.calculateScore.mockRejectedValue(
        new NotFoundException('Scorecard not found'),
      );

      await expect(controller.calculateScore(scorecardId)).rejects.toThrow(NotFoundException);
      expect(service.calculateScore).toHaveBeenCalledWith(1);
    });

    it('should handle no criteria defined error', async () => {
      mockSupplierScorecardsService.calculateScore.mockRejectedValue(
        new ConflictException('No criteria defined for this scorecard'),
      );

      await expect(controller.calculateScore(scorecardId)).rejects.toThrow(ConflictException);
      expect(service.calculateScore).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    const scorecardId = '1';
    const updateDto: UpdateSupplierScorecardDto = {
      period: '2024-Q2',
      criteria: [
        {
          name: 'Quality',
          weight: 50,
          score: 90,
        },
        {
          name: 'Delivery',
          weight: 50,
          score: 85,
        },
      ],
    };

    const mockUpdatedScorecard = {
      id: 1,
      supplier_id: 1,
      period: '2024-Q2',
      overall_score: 87.5,
      standing: 'Good',
      created_at: new Date(),
      updated_at: new Date(),
      supplier: {
        id: 1,
        name: 'Test Supplier',
      },
      criteria: [
        {
          id: 1,
          name: 'Quality',
          weight: 50,
          score: 90,
        },
        {
          id: 2,
          name: 'Delivery',
          weight: 50,
          score: 85,
        },
      ],
    };

    it('should update a scorecard successfully', async () => {
      mockSupplierScorecardsService.update.mockResolvedValue(mockUpdatedScorecard);

      const result = await controller.update(scorecardId, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(mockUpdatedScorecard);
    });

    it('should handle scorecard not found error', async () => {
      mockSupplierScorecardsService.update.mockRejectedValue(
        new NotFoundException('Scorecard not found'),
      );

      await expect(controller.update(scorecardId, updateDto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should handle supplier not found error when updating supplier_id', async () => {
      const updateDtoWithSupplier = { ...updateDto, supplier_id: 999 };
      mockSupplierScorecardsService.update.mockRejectedValue(
        new NotFoundException('Supplier not found'),
      );

      await expect(controller.update(scorecardId, updateDtoWithSupplier)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(1, updateDtoWithSupplier);
    });

    it('should handle duplicate period conflict', async () => {
      mockSupplierScorecardsService.update.mockRejectedValue(
        new ConflictException('Scorecard already exists for this supplier and period'),
      );

      await expect(controller.update(scorecardId, updateDto)).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should handle invalid criteria weights error', async () => {
      mockSupplierScorecardsService.update.mockRejectedValue(
        new ConflictException('Criteria weights must sum to 100%'),
      );

      await expect(controller.update(scorecardId, updateDto)).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    const scorecardId = '1';

    it('should remove a scorecard successfully', async () => {
      mockSupplierScorecardsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(scorecardId);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should handle scorecard not found error', async () => {
      mockSupplierScorecardsService.remove.mockRejectedValue(
        new NotFoundException('Scorecard not found'),
      );

      await expect(controller.remove(scorecardId)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});