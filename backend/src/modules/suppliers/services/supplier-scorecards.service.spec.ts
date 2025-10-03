import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SupplierScorecardsService } from './supplier-scorecards.service';
import { SupplierScorecard } from '../../../entities/supplier-scorecard.entity';
import { SupplierScorecardCriteria } from '../../../entities/supplier-scorecard.entity';
import { SupplierScorecardPeriod } from '../../../entities/supplier-scorecard.entity';
import { Supplier } from '../../../entities/supplier.entity';
import { CreateSupplierScorecardDto } from '../dto/create-supplier-scorecard.dto';
import { UpdateSupplierScorecardDto } from '../dto/update-supplier-scorecard.dto';

describe('SupplierScorecardsService', () => {
  let service: SupplierScorecardsService;
  let scorecardRepository: Repository<SupplierScorecard>;
  let criteriaRepository: Repository<SupplierScorecardCriteria>;
  let periodRepository: Repository<SupplierScorecardPeriod>;
  let supplierRepository: Repository<Supplier>;
  let mockRequest: any;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    clone: jest.fn().mockReturnThis(),
  };

  const mockScorecardRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockCriteriaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockPeriodRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockSupplierRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    mockRequest = {
      tenant_id: 'test-tenant',
      user: { email: 'test@example.com', tenant_id: 'test-tenant' },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierScorecardsService,
        {
          provide: getRepositoryToken(SupplierScorecard),
          useValue: mockScorecardRepository,
        },
        {
          provide: getRepositoryToken(SupplierScorecardCriteria),
          useValue: mockCriteriaRepository,
        },
        {
          provide: getRepositoryToken(SupplierScorecardPeriod),
          useValue: mockPeriodRepository,
        },
        {
          provide: getRepositoryToken(Supplier),
          useValue: mockSupplierRepository,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<SupplierScorecardsService>(SupplierScorecardsService);
    scorecardRepository = module.get<Repository<SupplierScorecard>>(getRepositoryToken(SupplierScorecard));
    criteriaRepository = module.get<Repository<SupplierScorecardCriteria>>(getRepositoryToken(SupplierScorecardCriteria));
    periodRepository = module.get<Repository<SupplierScorecardPeriod>>(getRepositoryToken(SupplierScorecardPeriod));
    supplierRepository = module.get<Repository<Supplier>>(getRepositoryToken(Supplier));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createScorecardDto: CreateSupplierScorecardDto = {
      supplier_id: 'supplier-1',
      period: 'Monthly',
      current_score: 85,
      criteria: [
        {
          criteria_name: 'Quality',
          weight: 50,
          formula: 'quality_score * 100',
          description: 'Quality assessment',
        },
        {
          criteria_name: 'Delivery',
          weight: 50,
          formula: 'delivery_score * 100',
          description: 'Delivery performance',
        },
      ],
      periods: [
        {
          period_start: new Date('2024-01-01'),
          period_end: new Date('2024-01-31'),
          score: 85,
          criteria_scores: { Quality: 90, Delivery: 80 },
        },
      ],
    };

    it('should create a scorecard successfully', async () => {
      const mockSupplier = { id: 'supplier-1', supplier_name: 'Test Supplier' };
      const mockScorecard = { id: '1', ...createScorecardDto };
      const mockCriteria = createScorecardDto.criteria.map((c, i) => ({ id: `criteria-${i + 1}`, ...c }));
      const mockPeriods = createScorecardDto.periods.map((p, i) => ({ id: `period-${i + 1}`, ...p }));

      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      mockScorecardRepository.findOne.mockResolvedValue(null); // No existing scorecard
      mockScorecardRepository.create.mockReturnValue(mockScorecard);
      mockScorecardRepository.save.mockResolvedValue(mockScorecard);
      mockCriteriaRepository.create.mockReturnValue(mockCriteria);
      mockCriteriaRepository.save.mockResolvedValue(mockCriteria);
      mockPeriodRepository.create.mockReturnValue(mockPeriods);
      mockPeriodRepository.save.mockResolvedValue(mockPeriods);

      // Mock findOne for the final return
      jest.spyOn(service, 'findOne').mockResolvedValue(mockScorecard as any);

      const result = await service.create(createScorecardDto);

      expect(mockSupplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'supplier-1', tenant_id: 'test-tenant' },
      });
      expect(mockScorecardRepository.create).toHaveBeenCalled();
      expect(mockScorecardRepository.save).toHaveBeenCalled();
      expect(mockCriteriaRepository.save).toHaveBeenCalled();
      expect(mockPeriodRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockScorecard);
    });

    it('should throw NotFoundException when supplier not found', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createScorecardDto)).rejects.toThrow(NotFoundException);
      expect(mockSupplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'supplier-1', tenant_id: 'test-tenant' },
      });
    });

    it('should throw ConflictException when scorecard already exists', async () => {
      const mockSupplier = { id: 'supplier-1', supplier_name: 'Test Supplier' };
      const existingScorecard = { id: '1', supplier_id: 'supplier-1', period: 'Monthly' };

      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      mockScorecardRepository.findOne.mockResolvedValue(existingScorecard);

      await expect(service.create(createScorecardDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when criteria weights do not sum to 100', async () => {
      const invalidDto = {
        ...createScorecardDto,
        criteria: [
          { criteria_name: 'Quality', weight: 60, formula: 'quality_score * 100' },
          { criteria_name: 'Delivery', weight: 30, formula: 'delivery_score * 100' },
        ],
      };

      const mockSupplier = { id: 'supplier-1', supplier_name: 'Test Supplier' };
      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      mockScorecardRepository.findOne.mockResolvedValue(null);

      await expect(service.create(invalidDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return scorecards with pagination', async () => {
      const mockScorecards = [
        { id: '1', period: 'Monthly', supplier: { supplier_name: 'Supplier A' } },
        { id: '2', period: 'Quarterly', supplier: { supplier_name: 'Supplier B' } },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockScorecards, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockScorecardRepository.createQueryBuilder).toHaveBeenCalledWith('scorecard');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('scorecard.supplier', 'supplier');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('scorecard.tenant_id = :tenant_id', { tenant_id: 'test-tenant' });
      expect(result).toEqual({ scorecards: mockScorecards, total: 2 });
    });

    it('should apply search filter', async () => {
      const mockScorecards = [];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockScorecards, 0]);

      await service.findAll({ search: 'test', page: 1, limit: 10 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(supplier.supplier_name LIKE :search OR scorecard.period LIKE :search)',
        { search: '%test%' }
      );
    });

    it('should apply filters', async () => {
      const mockScorecards = [];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockScorecards, 0]);

      await service.findAll({
        supplier_id: 'supplier-1',
        period: 'Monthly',
        standing: 'Excellent',
        page: 1,
        limit: 10,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('scorecard.supplier_id = :supplier_id', { supplier_id: 'supplier-1' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('scorecard.period = :period', { period: 'Monthly' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('scorecard.supplier_standing = :standing', { standing: 'Excellent' });
    });
  });

  describe('findOne', () => {
    it('should return a scorecard by id', async () => {
      const mockScorecard = {
        id: '1',
        period: 'Monthly',
        supplier: { supplier_name: 'Test Supplier' },
        criteria: [],
        periods: [],
      };

      mockScorecardRepository.findOne.mockResolvedValue(mockScorecard);

      const result = await service.findOne('1');

      expect(mockScorecardRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', tenant_id: 'test-tenant' },
        relations: ['supplier', 'criteria', 'periods'],
      });
      expect(result).toEqual(mockScorecard);
    });

    it('should throw NotFoundException when scorecard not found', async () => {
      mockScorecardRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySupplier', () => {
    it('should return scorecards for a supplier', async () => {
      const mockScorecards = [
        { id: '1', period: 'Monthly', supplier_id: 'supplier-1' },
        { id: '2', period: 'Quarterly', supplier_id: 'supplier-1' },
      ];

      mockScorecardRepository.find.mockResolvedValue(mockScorecards);

      const result = await service.findBySupplier('supplier-1');

      expect(mockScorecardRepository.find).toHaveBeenCalledWith({
        where: { supplier_id: 'supplier-1', tenant_id: 'test-tenant' },
        relations: ['criteria', 'periods'],
        order: { period: 'DESC' },
      });
      expect(result).toEqual(mockScorecards);
    });
  });

  describe('update', () => {
    const updateScorecardDto: UpdateSupplierScorecardDto = {
      current_score: 90,
      criteria: [
        { criteria_name: 'Quality', weight: 100, formula: 'updated_formula' },
      ],
    };

    it('should update a scorecard successfully', async () => {
      const existingScorecard = {
        id: '1',
        supplier_id: 'supplier-1',
        period: 'Monthly',
        current_score: 85,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingScorecard as any);
      mockCriteriaRepository.delete.mockResolvedValue({ affected: 1 });
      mockCriteriaRepository.create.mockReturnValue([{ id: 'criteria-1', ...updateScorecardDto.criteria[0] }]);
      mockCriteriaRepository.save.mockResolvedValue([]);
      mockScorecardRepository.save.mockResolvedValue(existingScorecard);

      const result = await service.update('1', updateScorecardDto);

      expect(mockCriteriaRepository.delete).toHaveBeenCalledWith({
        scorecard_id: '1',
        tenant_id: 'test-tenant',
      });
      expect(mockCriteriaRepository.save).toHaveBeenCalled();
      expect(mockScorecardRepository.save).toHaveBeenCalled();
      expect(result).toEqual(existingScorecard);
    });

    it('should throw NotFoundException when supplier not found during update', async () => {
      const existingScorecard = { id: '1', supplier_id: 'supplier-1', period: 'Monthly' };
      const updateDto = { ...updateScorecardDto, supplier_id: 'new-supplier' };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingScorecard as any);
      mockSupplierRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when period already exists for supplier', async () => {
      const existingScorecard = { id: '1', supplier_id: 'supplier-1', period: 'Monthly' };
      const updateDto = { ...updateScorecardDto, period: 'Quarterly' };
      const conflictingScorecard = { id: '2', supplier_id: 'supplier-1', period: 'Quarterly' };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingScorecard as any);
      mockScorecardRepository.findOne.mockResolvedValue(conflictingScorecard);

      await expect(service.update('1', updateDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when criteria weights do not sum to 100', async () => {
      const existingScorecard = { id: '1', supplier_id: 'supplier-1', period: 'Monthly' };
      const invalidDto = {
        ...updateScorecardDto,
        criteria: [{ criteria_name: 'Quality', weight: 80, formula: 'formula' }],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingScorecard as any);

      await expect(service.update('1', invalidDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a scorecard successfully', async () => {
      const mockScorecard = { id: '1', period: 'Monthly' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockScorecard as any);
      mockCriteriaRepository.delete.mockResolvedValue({ affected: 1 });
      mockPeriodRepository.delete.mockResolvedValue({ affected: 1 });
      mockScorecardRepository.remove.mockResolvedValue(mockScorecard);

      await service.remove('1');

      expect(mockCriteriaRepository.delete).toHaveBeenCalledWith({
        scorecard_id: '1',
        tenant_id: 'test-tenant',
      });
      expect(mockPeriodRepository.delete).toHaveBeenCalledWith({
        scorecard_id: '1',
        tenant_id: 'test-tenant',
      });
      expect(mockScorecardRepository.remove).toHaveBeenCalledWith(mockScorecard);
    });

    it('should throw NotFoundException when scorecard not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Supplier scorecard not found'));

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateScore', () => {
    it('should calculate score successfully', async () => {
      const mockScorecard = {
        id: '1',
        supplier_id: 'supplier-1',
        criteria: [
          { criteria_name: 'Quality', weight: 50 },
          { criteria_name: 'Delivery', weight: 50 },
        ],
        current_score: 0,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockScorecard as any);
      jest.spyOn(service as any, 'calculateCriteriaScore').mockResolvedValue(80);
      mockScorecardRepository.save.mockResolvedValue(mockScorecard);

      const result = await service.calculateScore('1');

      expect(mockScorecardRepository.save).toHaveBeenCalled();
      expect(result.current_score).toBe(80);
      expect(result.supplier_standing).toBe('Very Good');
    });

    it('should throw ConflictException when no criteria defined', async () => {
      const mockScorecard = { id: '1', criteria: [] };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockScorecard as any);

      await expect(service.calculateScore('1')).rejects.toThrow(ConflictException);
    });
  });

  describe('getScorecardStats', () => {
    it('should return scorecard statistics', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(10);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { standing: 'Excellent', count: '5' },
          { standing: 'Good', count: '3' },
          { standing: 'Poor', count: '2' },
        ])
        .mockResolvedValueOnce([
          { period: 'Monthly', count: '6' },
          { period: 'Quarterly', count: '4' },
        ]);
      mockQueryBuilder.getRawOne.mockResolvedValue({ average_score: '75.5' });
      mockScorecardRepository.find
        .mockResolvedValueOnce([{ id: '1', current_score: 95 }]) // top performers
        .mockResolvedValueOnce([{ id: '2', current_score: 30 }]); // poor performers

      const result = await service.getScorecardStats();

      expect(result.total).toBe(10);
      expect(result.byStanding).toEqual({ Excellent: 5, Good: 3, Poor: 2 });
      expect(result.byPeriod).toEqual({ Monthly: 6, Quarterly: 4 });
      expect(result.averageScore).toBe(75.5);
      expect(result.topPerformers).toHaveLength(1);
      expect(result.poorPerformers).toHaveLength(1);
    });
  });

  describe('getSupplierPerformanceTrend', () => {
    it('should return performance trend for supplier', async () => {
      const mockSupplier = { id: 'supplier-1', supplier_name: 'Test Supplier' };
      const mockScorecards = [
        { id: '1', current_score: 85, period: 'Q2-2024' },
        { id: '2', current_score: 75, period: 'Q1-2024' },
      ];

      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      jest.spyOn(service, 'findBySupplier').mockResolvedValue(mockScorecards as any);

      const result = await service.getSupplierPerformanceTrend('supplier-1');

      expect(result.supplier).toEqual(mockSupplier);
      expect(result.scorecards).toEqual(mockScorecards);
      expect(result.trend).toBe('improving');
      expect(result.trendPercentage).toBe(13.33);
    });

    it('should throw NotFoundException when supplier not found', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(null);

      await expect(service.getSupplierPerformanceTrend('999')).rejects.toThrow(NotFoundException);
    });

    it('should return stable trend when less than 2 scorecards', async () => {
      const mockSupplier = { id: 'supplier-1', supplier_name: 'Test Supplier' };
      const mockScorecards = [{ id: '1', current_score: 85 }];

      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      jest.spyOn(service, 'findBySupplier').mockResolvedValue(mockScorecards as any);

      const result = await service.getSupplierPerformanceTrend('supplier-1');

      expect(result.trend).toBe('stable');
      expect(result.trendPercentage).toBe(0);
    });
  });
});