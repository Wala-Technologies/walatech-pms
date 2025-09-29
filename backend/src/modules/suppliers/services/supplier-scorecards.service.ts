import { Injectable, NotFoundException, ConflictException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { SupplierScorecard } from '../../../entities/supplier-scorecard.entity';
import { SupplierScorecardCriteria } from '../../../entities/supplier-scorecard.entity';
import { SupplierScorecardPeriod } from '../../../entities/supplier-scorecard.entity';
import { Supplier } from '../../../entities/supplier.entity';
import { CreateSupplierScorecardDto } from '../dto/create-supplier-scorecard.dto';
import { UpdateSupplierScorecardDto } from '../dto/update-supplier-scorecard.dto';

@Injectable({ scope: Scope.REQUEST })
export class SupplierScorecardsService {
  constructor(
    @InjectRepository(SupplierScorecard)
    private scorecardRepository: Repository<SupplierScorecard>,
    @InjectRepository(SupplierScorecardCriteria)
    private criteriaRepository: Repository<SupplierScorecardCriteria>,
    @InjectRepository(SupplierScorecardPeriod)
    private periodRepository: Repository<SupplierScorecardPeriod>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @Inject(REQUEST) private request: any,
  ) {}

  private get tenant_id(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  async create(createScorecardDto: CreateSupplierScorecardDto): Promise<SupplierScorecard> {
    // Validate supplier exists
    const supplier = await this.supplierRepository.findOne({
      where: {
        id: createScorecardDto.supplier_id,
        tenant_id: this.tenant_id,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Check if scorecard already exists for this supplier and period
    const existingScorecard = await this.scorecardRepository.findOne({
      where: {
        supplier_id: createScorecardDto.supplier_id,
        period: createScorecardDto.period,
        tenant_id: this.tenant_id,
      },
    });

    if (existingScorecard) {
      throw new ConflictException('Scorecard already exists for this supplier and period');
    }

    // Validate criteria weights sum to 100
    if (createScorecardDto.criteria && createScorecardDto.criteria.length > 0) {
      const totalWeight = createScorecardDto.criteria.reduce((sum, criteria) => sum + criteria.weight, 0);
      if (Math.abs(totalWeight - 100) > 0.01) {
        throw new ConflictException('Total criteria weights must equal 100%');
      }
    }

    // Create scorecard
    const { criteria, periods, ...scorecardData } = createScorecardDto;
    const scorecard = this.scorecardRepository.create({
      ...scorecardData,
      tenant_id: this.tenant_id,
      owner: this.request.user?.email || 'system',
    });

    const savedScorecard = await this.scorecardRepository.save(scorecard) as SupplierScorecard;

    // Create criteria
    if (createScorecardDto.criteria && createScorecardDto.criteria.length > 0) {
      const criteria = createScorecardDto.criteria.map(criteriaDto =>
        this.criteriaRepository.create({
          ...criteriaDto,
          scorecard_id: savedScorecard.id,
          tenant_id: this.tenant_id,
          owner: this.request.user?.email || 'system',
        })
      );

      await this.criteriaRepository.save(criteria);
    }

    // Create periods
    if (createScorecardDto.periods && createScorecardDto.periods.length > 0) {
      const periodsToCreate = createScorecardDto.periods.map(periodDto => {
        const periodData: any = {
          ...periodDto,
          scorecard_id: savedScorecard.id,
          tenant_id: this.tenant_id,
          owner: this.request.user?.email || 'system',
        };
        
        // Parse criteria_scores if it's a string
        if (periodDto.criteria_scores && typeof periodDto.criteria_scores === 'string') {
          try {
            periodData.criteria_scores = JSON.parse(periodDto.criteria_scores);
          } catch (e) {
            periodData.criteria_scores = {};
          }
        }
        
        return periodData;
      });

      const periods = this.periodRepository.create(periodsToCreate);
      await this.periodRepository.save(periods);
    }

    return this.findOne(savedScorecard.id);
  }

  async findAll(query: any = {}): Promise<{ scorecards: SupplierScorecard[]; total: number }> {
    const { page = 1, limit = 10, search, supplier_id, period, standing, ...filters } = query;
    const skip = (page - 1) * limit;

    const queryBuilder: SelectQueryBuilder<SupplierScorecard> = this.scorecardRepository
      .createQueryBuilder('scorecard')
      .leftJoinAndSelect('scorecard.supplier', 'supplier')
      .leftJoinAndSelect('scorecard.criteria', 'criteria')
      .leftJoinAndSelect('scorecard.periods', 'periods')
      .where('scorecard.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(supplier.supplier_name LIKE :search OR scorecard.period LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    if (supplier_id) {
      queryBuilder.andWhere('scorecard.supplier_id = :supplier_id', { supplier_id });
    }

    if (period) {
      queryBuilder.andWhere('scorecard.period = :period', { period });
    }

    if (standing) {
      queryBuilder.andWhere('scorecard.supplier_standing = :standing', { standing });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryBuilder.andWhere(`scorecard.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    queryBuilder.orderBy('scorecard.period', 'DESC');

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [scorecards, total] = await queryBuilder.getManyAndCount();

    return { scorecards, total };
  }

  async findOne(id: string): Promise<SupplierScorecard> {
    const scorecard = await this.scorecardRepository.findOne({
      where: { id, tenant_id: this.tenant_id },
      relations: ['supplier', 'criteria', 'periods'],
    });

    if (!scorecard) {
      throw new NotFoundException('Supplier scorecard not found');
    }

    return scorecard;
  }

  async findBySupplier(supplierId: string): Promise<SupplierScorecard[]> {
    return this.scorecardRepository.find({
      where: {
        supplier_id: supplierId,
        tenant_id: this.tenant_id,
      },
      relations: ['criteria', 'periods'],
      order: { period: 'DESC' },
    });
  }

  async update(id: string, updateScorecardDto: UpdateSupplierScorecardDto): Promise<SupplierScorecard> {
    const scorecard = await this.findOne(id);

    // Validate supplier if being updated
    if (updateScorecardDto.supplier_id && updateScorecardDto.supplier_id !== scorecard.supplier_id) {
      const supplier = await this.supplierRepository.findOne({
        where: {
          id: updateScorecardDto.supplier_id,
          tenant_id: this.tenant_id,
        },
      });

      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    // Check for duplicate period if being updated
    if (updateScorecardDto.period && updateScorecardDto.period !== scorecard.period) {
      const existingScorecard = await this.scorecardRepository.findOne({
        where: {
          supplier_id: updateScorecardDto.supplier_id || scorecard.supplier_id,
          period: updateScorecardDto.period,
          tenant_id: this.tenant_id,
        },
      });

      if (existingScorecard && existingScorecard.id !== id) {
        throw new ConflictException('Scorecard already exists for this supplier and period');
      }
    }

    // Validate criteria weights if being updated
    if (updateScorecardDto.criteria && updateScorecardDto.criteria.length > 0) {
      const totalWeight = updateScorecardDto.criteria.reduce((sum, criteria) => sum + criteria.weight, 0);
      if (Math.abs(totalWeight - 100) > 0.01) {
        throw new ConflictException('Total criteria weights must equal 100%');
      }
    }

    // Update scorecard
    Object.assign(scorecard, updateScorecardDto);
    scorecard.modified_by = this.request.user?.email || 'system';

    // Update criteria if provided
    if (updateScorecardDto.criteria) {
      // Remove existing criteria
      await this.criteriaRepository.delete({
        scorecard_id: id,
        tenant_id: this.tenant_id,
      });

      // Create new criteria
      if (updateScorecardDto.criteria.length > 0) {
        const criteria = updateScorecardDto.criteria.map(criteriaDto =>
          this.criteriaRepository.create({
            ...criteriaDto,
            scorecard_id: id,
            tenant_id: this.tenant_id,
            owner: this.request.user?.email || 'system',
          })
        );

        await this.criteriaRepository.save(criteria);
      }
    }

    // Update periods if provided
    if (updateScorecardDto.periods) {
      // Remove existing periods
      await this.periodRepository.delete({
        scorecard_id: id,
        tenant_id: this.tenant_id,
      });

      // Create new periods
      if (updateScorecardDto.periods.length > 0) {
        const periodsToCreate = updateScorecardDto.periods.map(periodDto => {
          const periodData: any = {
            ...periodDto,
            scorecard_id: id,
            tenant_id: this.tenant_id,
            owner: this.request.user?.email || 'system',
          };
          
          // Parse criteria_scores if it's a string
          if (periodDto.criteria_scores && typeof periodDto.criteria_scores === 'string') {
            try {
              periodData.criteria_scores = JSON.parse(periodDto.criteria_scores);
            } catch (e) {
              periodData.criteria_scores = {};
            }
          }
          
          return periodData;
        });

        const periods = this.periodRepository.create(periodsToCreate);
        await this.periodRepository.save(periods);
      }
    }

    await this.scorecardRepository.save(scorecard);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const scorecard = await this.findOne(id);

    // Remove related records first
    await this.criteriaRepository.delete({
      scorecard_id: id,
      tenant_id: this.tenant_id,
    });

    await this.periodRepository.delete({
      scorecard_id: id,
      tenant_id: this.tenant_id,
    });

    // Remove scorecard
    await this.scorecardRepository.remove(scorecard);
  }

  async calculateScore(id: string): Promise<SupplierScorecard> {
    const scorecard = await this.findOne(id);

    if (!scorecard.criteria || scorecard.criteria.length === 0) {
      throw new ConflictException('No criteria defined for scorecard');
    }

    // Calculate weighted score based on criteria
    let totalScore = 0;
    const criteriaScores: { [key: string]: number } = {};

    for (const criteria of scorecard.criteria) {
      // This is a simplified calculation - in reality, you'd fetch actual performance data
      // and apply the formula to calculate the score for each criteria
      const criteriaScore = await this.calculateCriteriaScore(scorecard.supplier_id, criteria);
      criteriaScores[criteria.criteria_name] = criteriaScore;
      totalScore += (criteriaScore * criteria.weight) / 100;
    }

    // Update scorecard with calculated score
    scorecard.current_score = Math.round(totalScore * 100) / 100;
    scorecard.supplier_standing = this.determineSupplierStanding(scorecard.current_score);
    scorecard.modified_by = this.request.user?.email || 'system';

    // Update RFQ and PO flags based on standing
    if (scorecard.supplier_standing === 'Poor' || scorecard.supplier_standing === 'Very Poor') {
      scorecard.warn_rfqs = true;
      scorecard.warn_pos = true;
      if (scorecard.current_score < 30) {
        scorecard.prevent_rfqs = true;
        scorecard.prevent_pos = true;
      }
    } else {
      scorecard.warn_rfqs = false;
      scorecard.warn_pos = false;
      scorecard.prevent_rfqs = false;
      scorecard.prevent_pos = false;
    }

    await this.scorecardRepository.save(scorecard);
    return scorecard;
  }

  async getScorecardStats(): Promise<{
    total: number;
    byStanding: { [key: string]: number };
    byPeriod: { [key: string]: number };
    averageScore: number;
    topPerformers: SupplierScorecard[];
    poorPerformers: SupplierScorecard[];
  }> {
    const queryBuilder = this.scorecardRepository
      .createQueryBuilder('scorecard')
      .leftJoin('scorecard.supplier', 'supplier')
      .where('scorecard.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    const total = await queryBuilder.getCount();

    // Get stats by standing
    const standingStats = await queryBuilder
      .clone()
      .select('scorecard.supplier_standing', 'standing')
      .addSelect('COUNT(*)', 'count')
      .groupBy('scorecard.supplier_standing')
      .getRawMany();

    const byStanding = standingStats.reduce((acc, stat) => {
      acc[stat.standing || 'Unknown'] = parseInt(stat.count);
      return acc;
    }, {});

    // Get stats by period
    const periodStats = await queryBuilder
      .clone()
      .select('scorecard.period', 'period')
      .addSelect('COUNT(*)', 'count')
      .groupBy('scorecard.period')
      .getRawMany();

    const byPeriod = periodStats.reduce((acc, stat) => {
      acc[stat.period || 'Unknown'] = parseInt(stat.count);
      return acc;
    }, {});

    // Get average score
    const avgResult = await queryBuilder
      .clone()
      .select('AVG(scorecard.current_score)', 'average_score')
      .getRawOne();

    const averageScore = parseFloat(avgResult.average_score) || 0;

    // Get top performers (score >= 80)
    const topPerformers = await this.scorecardRepository.find({
      where: {
        tenant_id: this.tenant_id,
        current_score: Between(80, 100),
      },
      relations: ['supplier'],
      order: { current_score: 'DESC' },
      take: 10,
    });

    // Get poor performers (score < 50)
    const poorPerformers = await this.scorecardRepository.find({
      where: {
        tenant_id: this.tenant_id,
        current_score: Between(0, 49),
      },
      relations: ['supplier'],
      order: { current_score: 'ASC' },
      take: 10,
    });

    return {
      total,
      byStanding,
      byPeriod,
      averageScore,
      topPerformers,
      poorPerformers,
    };
  }

  async getSupplierPerformanceTrend(supplierId: string): Promise<{
    supplier: Supplier;
    scorecards: SupplierScorecard[];
    trend: 'improving' | 'declining' | 'stable';
    trendPercentage: number;
  }> {
    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId, tenant_id: this.tenant_id },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const scorecards = await this.findBySupplier(supplierId);

    if (scorecards.length < 2) {
      return {
        supplier,
        scorecards,
        trend: 'stable',
        trendPercentage: 0,
      };
    }

    // Calculate trend based on last two scorecards
    const latest = scorecards[0];
    const previous = scorecards[1];

    const scoreDifference = latest.current_score - previous.current_score;
    const trendPercentage = Math.abs((scoreDifference / previous.current_score) * 100);

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (scoreDifference > 5) {
      trend = 'improving';
    } else if (scoreDifference < -5) {
      trend = 'declining';
    }

    return {
      supplier,
      scorecards,
      trend,
      trendPercentage: Math.round(trendPercentage * 100) / 100,
    };
  }

  private async calculateCriteriaScore(supplierId: string, criteria: SupplierScorecardCriteria): Promise<number> {
    // This is a simplified implementation
    // In a real system, you would:
    // 1. Fetch actual performance data based on the criteria
    // 2. Apply the formula to calculate the score
    // 3. Return the calculated score

    // For now, return a random score between 0-100
    // This should be replaced with actual business logic
    return Math.floor(Math.random() * 101);
  }

  private determineSupplierStanding(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 50) return 'Poor';
    return 'Very Poor';
  }
}