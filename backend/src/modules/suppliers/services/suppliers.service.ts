import { Injectable, NotFoundException, ConflictException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Supplier } from '../../../entities/supplier.entity';
import { SupplierGroup } from '../../../entities/supplier-group.entity';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { SupplierQueryDto } from '../dto/supplier-query.dto';
import { DepartmentAccessService } from '../../../common/services/department-access.service';

@Injectable({ scope: Scope.REQUEST })
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(SupplierGroup)
    private supplierGroupRepository: Repository<SupplierGroup>,
    @Inject(REQUEST) private request: any,
    private departmentAccessService: DepartmentAccessService,
  ) {}

  private get tenant_id(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    try {
      console.log('[SuppliersService.create] Starting supplier creation', { 
        supplier_name: createSupplierDto.supplier_name,
        tenant_id: this.tenant_id 
      });

      // Check if supplier with same name already exists for this tenant
      const existingSupplier = await this.supplierRepository.findOne({
        where: {
          supplier_name: createSupplierDto.supplier_name,
          tenant_id: this.tenant_id,
        },
      });

      if (existingSupplier) {
        throw new ConflictException('Supplier with this name already exists');
      }

      // Check if supplier code is provided and unique
      if (createSupplierDto.supplier_code) {
        const existingCode = await this.supplierRepository.findOne({
          where: {
            supplier_code: createSupplierDto.supplier_code,
            tenant_id: this.tenant_id,
          },
        });

        if (existingCode) {
          throw new ConflictException('Supplier with this code already exists');
        }
      }

      // Validate supplier group if provided
      if (createSupplierDto.supplier_group) {
        console.log('[SuppliersService.create] Validating supplier group', { supplier_group: createSupplierDto.supplier_group });
        const supplierGroup = await this.supplierGroupRepository.findOne({
          where: {
            id: createSupplierDto.supplier_group,
            tenant_id: this.tenant_id,
          },
        });

        if (!supplierGroup) {
          throw new NotFoundException('Supplier group not found');
        }
      }

      // Handle department assignment and validation
      let department_id = createSupplierDto.department_id;
      
      if (department_id) {
        // Validate user has access to the specified department
        const hasAccess = this.departmentAccessService.canAccessDepartment(
          this.request.user,
          department_id
        );
        
        if (!hasAccess) {
          throw new NotFoundException('Department not found or access denied');
        }
      } else {
        // If no department specified, assign to user's department
        department_id = this.request.user?.department_id;
      }

      console.log('[SuppliersService.create] Creating supplier entity');
      const supplier = this.supplierRepository.create({
        ...createSupplierDto,
        department_id,
        tenant_id: this.tenant_id,
        owner: this.request.user?.email || 'system',
      });

      console.log('[SuppliersService.create] Saving supplier to database');
      const savedSupplier = await this.supplierRepository.save(supplier);
      console.log('[SuppliersService.create] Supplier saved successfully', { id: savedSupplier.id });
      
      return savedSupplier;
    } catch (error) {
      console.error('[SuppliersService.create] Error creating supplier:', error.message);
      console.error('[SuppliersService.create] Error stack:', error.stack);
      throw error;
    }
  }

  async findAll(query: SupplierQueryDto): Promise<{ suppliers: Supplier[]; total: number }> {
    const { page = 1, limit = 10, search, sort_by = 'supplier_name', sort_order = 'ASC', ...filters } = query;
    const skip = (page - 1) * limit;

    // Get accessible departments for the user
    const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(
      this.request.user
    );

    const queryBuilder: SelectQueryBuilder<Supplier> = this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.supplierGroup', 'supplierGroup')
      .where('supplier.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    // Apply department filtering if user doesn't have access to all departments
    if (accessibleDepartments !== null) {
      if (accessibleDepartments.length === 0) {
        return { suppliers: [], total: 0 };
      }
      queryBuilder.andWhere('supplier.department_id IN (:...departmentIds)', { 
        departmentIds: accessibleDepartments 
      });
    }

    // Apply search
    if (search) {
      queryBuilder.andWhere(
        '(supplier.supplier_name LIKE :search OR supplier.email LIKE :search OR supplier.supplier_code LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryBuilder.andWhere(`supplier.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    queryBuilder.orderBy(`supplier.${sort_by}`, sort_order);

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [suppliers, total] = await queryBuilder.getManyAndCount();

    return { suppliers, total };
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id, tenant_id: this.tenant_id },
      relations: ['supplierGroup'],
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Validate user has access to the supplier's department
    const hasAccess = supplier.department_id ? 
      this.departmentAccessService.canAccessDepartment(
        this.request.user,
        supplier.department_id
      ) : true; // Allow access if no department is assigned

    if (!hasAccess) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);

    // Check if supplier name is being updated and is unique
    if (updateSupplierDto.supplier_name && updateSupplierDto.supplier_name !== supplier.supplier_name) {
      const existingSupplier = await this.supplierRepository.findOne({
        where: {
          supplier_name: updateSupplierDto.supplier_name,
          tenant_id: this.tenant_id,
        },
      });

      if (existingSupplier && existingSupplier.id !== id) {
        throw new ConflictException('Supplier with this name already exists');
      }
    }

    // Check if supplier code is being updated and is unique
    if (updateSupplierDto.supplier_code && updateSupplierDto.supplier_code !== supplier.supplier_code) {
      const existingCode = await this.supplierRepository.findOne({
        where: {
          supplier_code: updateSupplierDto.supplier_code,
          tenant_id: this.tenant_id,
        },
      });

      if (existingCode && existingCode.id !== id) {
        throw new ConflictException('Supplier with this code already exists');
      }
    }

    // Validate supplier group if being updated
    if (updateSupplierDto.supplier_group) {
      const supplierGroup = await this.supplierGroupRepository.findOne({
        where: {
          id: updateSupplierDto.supplier_group,
          tenant_id: this.tenant_id,
        },
      });

      if (!supplierGroup) {
        throw new NotFoundException('Supplier group not found');
      }
    }

    // Validate department access if department_id is being updated
    if (updateSupplierDto.department_id && updateSupplierDto.department_id !== supplier.department_id) {
      const hasAccess = this.departmentAccessService.canAccessDepartment(
        this.request.user,
        updateSupplierDto.department_id
      );

      if (!hasAccess) {
        throw new NotFoundException('Department not found or access denied');
      }
    }

    Object.assign(supplier, updateSupplierDto);
    supplier.modified_by = this.request.user?.email || 'system';

    return this.supplierRepository.save(supplier);
  }

  async remove(id: string): Promise<void> {
    try {
      const supplier = await this.findOne(id);
      await this.supplierRepository.remove(supplier);
    } catch (error) {
      console.error('Error removing supplier:', error);
      throw error;
    }
  }

  async getSupplierStats(): Promise<{
    total: number;
    active: number;
    disabled: number;
    onHold: number;
    byType: { [key: string]: number };
    byCountry: { [key: string]: number };
    byGstCategory: { [key: string]: number };
    bySupplierGroup: { [key: string]: number };
  }> {
    const queryBuilder = this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoin('supplier.supplierGroup', 'supplierGroup')
      .where('supplier.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    const total = await queryBuilder.getCount();

    const active = await queryBuilder
      .clone()
      .andWhere('supplier.disabled = :disabled AND (supplier.hold_type IS NULL OR supplier.hold_type = :empty)', 
        { disabled: false, empty: '' })
      .getCount();

    const disabled = await queryBuilder
      .clone()
      .andWhere('supplier.disabled = :disabled', { disabled: true })
      .getCount();

    const onHold = await queryBuilder
      .clone()
      .andWhere('supplier.hold_type IS NOT NULL AND supplier.hold_type != :empty', { empty: '' })
      .getCount();

    // Get stats by type
    const typeStats = await queryBuilder
      .clone()
      .select('supplier.supplier_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('supplier.supplier_type')
      .getRawMany();

    const byType = typeStats.reduce((acc, stat) => {
      acc[stat.type || 'Unknown'] = parseInt(stat.count);
      return acc;
    }, {});

    // Get stats by country
    const countryStats = await queryBuilder
      .clone()
      .select('supplier.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('supplier.country IS NOT NULL')
      .groupBy('supplier.country')
      .getRawMany();

    const byCountry = countryStats.reduce((acc, stat) => {
      acc[stat.country] = parseInt(stat.count);
      return acc;
    }, {});

    // Get stats by GST category
    const gstStats = await queryBuilder
      .clone()
      .select('supplier.gst_category', 'gst_category')
      .addSelect('COUNT(*)', 'count')
      .where('supplier.gst_category IS NOT NULL')
      .groupBy('supplier.gst_category')
      .getRawMany();

    const byGstCategory = gstStats.reduce((acc, stat) => {
      acc[stat.gst_category] = parseInt(stat.count);
      return acc;
    }, {});

    // Get stats by supplier group
    const groupStats = await queryBuilder
      .clone()
      .select('supplierGroup.supplier_group_name', 'group_name')
      .addSelect('COUNT(*)', 'count')
      .where('supplierGroup.supplier_group_name IS NOT NULL')
      .groupBy('supplierGroup.supplier_group_name')
      .getRawMany();

    const bySupplierGroup = groupStats.reduce((acc, stat) => {
      acc[stat.group_name] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      total,
      active,
      disabled,
      onHold,
      byType,
      byCountry,
      byGstCategory,
      bySupplierGroup,
    };
  }

  async getSuppliersByType(supplierType: string): Promise<Supplier[]> {
    // Get accessible departments for the user
    const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(
      this.request.user
    );

    const queryBuilder = this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.supplierGroup', 'supplierGroup')
      .where('supplier.tenant_id = :tenant_id', { tenant_id: this.tenant_id })
      .andWhere('supplier.supplier_type = :supplierType', { supplierType });

    // Apply department filtering if user doesn't have access to all departments
    if (accessibleDepartments !== null) {
      if (accessibleDepartments.length === 0) {
        return [];
      }
      queryBuilder.andWhere('supplier.department_id IN (:...departmentIds)', { 
        departmentIds: accessibleDepartments 
      });
    }

    queryBuilder.orderBy('supplier.supplier_name', 'ASC');

    return queryBuilder.getMany();
  }

  async getSuppliersByCountry(country: string): Promise<Supplier[]> {
    // Get accessible departments for the user
    const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(
      this.request.user
    );

    const queryBuilder = this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.supplierGroup', 'supplierGroup')
      .where('supplier.tenant_id = :tenant_id', { tenant_id: this.tenant_id })
      .andWhere('supplier.country = :country', { country });

    // Apply department filtering if user doesn't have access to all departments
    if (accessibleDepartments !== null) {
      if (accessibleDepartments.length === 0) {
        return [];
      }
      queryBuilder.andWhere('supplier.department_id IN (:...departmentIds)', { 
        departmentIds: accessibleDepartments 
      });
    }

    queryBuilder.orderBy('supplier.supplier_name', 'ASC');

    return queryBuilder.getMany();
  }

  async getSuppliersByGroup(groupId: string): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: {
        supplier_group: groupId,
        tenant_id: this.tenant_id,
      },
      relations: ['supplierGroup'],
      order: { supplier_name: 'ASC' },
    });
  }

  async toggleSupplierStatus(id: string): Promise<Supplier> {
    const supplier = await this.findOne(id);
    supplier.disabled = !supplier.disabled;
    supplier.modified_by = this.request.user?.email || 'system';
    return this.supplierRepository.save(supplier);
  }

  async updateHoldStatus(id: string, holdType: string, releaseDate?: string): Promise<Supplier> {
    const supplier = await this.findOne(id);
    supplier.hold_type = holdType;
    supplier.release_date = releaseDate ? new Date(releaseDate) : null;
    supplier.modified_by = this.request.user?.email || 'system';
    return this.supplierRepository.save(supplier);
  }

  async bulkUpdateSuppliers(supplierIds: string[], updateData: Partial<UpdateSupplierDto>): Promise<void> {
    if (!supplierIds || supplierIds.length === 0) {
      throw new ConflictException('No supplier IDs provided');
    }

    await this.supplierRepository
      .createQueryBuilder()
      .update(Supplier)
      .set({
        ...updateData,
        modified_by: this.request.user?.email || 'system',
      })
      .where('id IN (:...ids) AND tenant_id = :tenant_id', {
        ids: supplierIds,
        tenant_id: this.tenant_id,
      })
      .execute();
  }

  async searchSuppliers(searchTerm: string, limit: number = 10): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: [
        { supplier_name: Like(`%${searchTerm}%`), tenant_id: this.tenant_id },
        { email: Like(`%${searchTerm}%`), tenant_id: this.tenant_id },
        { supplier_code: Like(`%${searchTerm}%`), tenant_id: this.tenant_id },
      ],
      relations: ['supplierGroup'],
      take: limit,
      order: { supplier_name: 'ASC' },
    });
  }

  // ERPNext specific methods
  async validateSupplierForRFQ(supplierId: string): Promise<{ canProceed: boolean; warnings: string[] }> {
    const supplier = await this.findOne(supplierId);
    const warnings: string[] = [];
    let canProceed = true;

    if (supplier.disabled) {
      warnings.push('Supplier is disabled');
      canProceed = false;
    }

    if (supplier.prevent_rfqs) {
      warnings.push('RFQs are prevented for this supplier');
      canProceed = false;
    }

    if (supplier.warn_rfqs) {
      warnings.push('Warning: This supplier has RFQ warnings enabled');
    }

    if (supplier.hold_type && ['All', 'Invoices'].includes(supplier.hold_type)) {
      warnings.push(`Supplier is on hold: ${supplier.hold_type}`);
      if (supplier.hold_type === 'All') {
        canProceed = false;
      }
    }

    return { canProceed, warnings };
  }

  async validateSupplierForPO(supplierId: string): Promise<{ canProceed: boolean; warnings: string[] }> {
    const supplier = await this.findOne(supplierId);
    const warnings: string[] = [];
    let canProceed = true;

    if (supplier.disabled) {
      warnings.push('Supplier is disabled');
      canProceed = false;
    }

    if (supplier.prevent_pos) {
      warnings.push('Purchase Orders are prevented for this supplier');
      canProceed = false;
    }

    if (supplier.warn_pos) {
      warnings.push('Warning: This supplier has Purchase Order warnings enabled');
    }

    if (supplier.hold_type && ['All', 'Payments'].includes(supplier.hold_type)) {
      warnings.push(`Supplier is on hold: ${supplier.hold_type}`);
      if (supplier.hold_type === 'All') {
        canProceed = false;
      }
    }

    return { canProceed, warnings };
  }

  async getSupplierPaymentTerms(supplierId: string): Promise<string | null> {
    const supplier = await this.findOne(supplierId);
    
    if (supplier.default_payment_terms_template) {
      return supplier.default_payment_terms_template;
    }

    // If no payment terms on supplier, check supplier group
    if (supplier.supplierGroup?.default_payment_terms_template) {
      return supplier.supplierGroup.default_payment_terms_template;
    }

    return null;
  }

  async getSupplierPriceList(supplierId: string): Promise<string | null> {
    const supplier = await this.findOne(supplierId);
    
    if (supplier.default_price_list) {
      return supplier.default_price_list;
    }

    // If no price list on supplier, check supplier group
    if (supplier.supplierGroup?.default_price_list) {
      return supplier.supplierGroup.default_price_list;
    }

    return null;
  }

  async getSuppliersByGstCategory(category: string): Promise<Supplier[]> {
    // Get accessible departments for the user
    const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(
      this.request.user
    );

    const queryBuilder = this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.supplierGroup', 'supplierGroup')
      .where('supplier.tenant_id = :tenant_id', { tenant_id: this.tenant_id })
      .andWhere('supplier.gst_category = :category', { category });

    // Apply department filtering if user doesn't have access to all departments
    if (accessibleDepartments !== null) {
      if (accessibleDepartments.length === 0) {
        return [];
      }
      queryBuilder.andWhere('supplier.department_id IN (:...departmentIds)', { 
        departmentIds: accessibleDepartments 
      });
    }

    queryBuilder.orderBy('supplier.supplier_name', 'ASC');

    return queryBuilder.getMany();
  }

  async getEffectivePaymentTerms(id: string): Promise<string | null> {
    return this.getSupplierPaymentTerms(id);
  }

  async getEffectivePriceList(id: string): Promise<string | null> {
    return this.getSupplierPriceList(id);
  }

  async validateRfqCreation(id: string): Promise<{
    canCreate: boolean;
    warning?: string;
    reason?: string;
  }> {
    const validation = await this.validateSupplierForRFQ(id);
    return {
      canCreate: validation.canProceed,
      warning: validation.warnings.length > 0 ? validation.warnings.join(', ') : undefined,
      reason: !validation.canProceed ? 'Supplier validation failed' : undefined,
    };
  }

  async validatePurchaseOrderCreation(id: string): Promise<{
    canCreate: boolean;
    warning?: string;
    reason?: string;
  }> {
    const validation = await this.validateSupplierForPO(id);
    return {
      canCreate: validation.canProceed,
      warning: validation.warnings.length > 0 ? validation.warnings.join(', ') : undefined,
      reason: !validation.canProceed ? 'Supplier validation failed' : undefined,
    };
  }
}