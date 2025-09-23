import { Repository, SelectQueryBuilder, FindManyOptions, FindOneOptions } from 'typeorm';
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

export interface TenantScopedEntity {
  tenant_id?: string;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantScopedRepository<T extends TenantScopedEntity> {
  constructor(
    private repository: Repository<T>,
    @Inject(REQUEST) private request: Request,
  ) {}

  private getTenantId(): string | undefined {
    return this.request.tenantId;
  }

  private addTenantScope(queryBuilder: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
    const tenantId = this.getTenantId();
    if (tenantId) {
      queryBuilder.andWhere(`${queryBuilder.alias}.tenant_id = :tenantId`, { tenantId });
    }
    return queryBuilder;
  }

  private addTenantScopeToOptions(options: FindManyOptions<T> | FindOneOptions<T>): FindManyOptions<T> | FindOneOptions<T> {
    const tenantId = this.getTenantId();
    if (tenantId) {
      options.where = {
        ...options.where,
        tenant_id: tenantId as any,
      };
    }
    return options;
  }

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    const scopedOptions = options ? this.addTenantScopeToOptions(options) : { where: { tenant_id: this.getTenantId() } };
    return this.repository.find(scopedOptions as FindManyOptions<T>);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    const scopedOptions = this.addTenantScopeToOptions(options);
    return this.repository.findOne(scopedOptions);
  }

  async findById(id: string): Promise<T | null> {
    const tenantId = this.getTenantId();
    const where: any = { id };
    if (tenantId) {
      where.tenant_id = tenantId;
    }
    return this.repository.findOne({ where });
  }

  async save(entity: Partial<T>): Promise<T> {
    const tenantId = this.getTenantId();
    if (tenantId && !entity.tenant_id) {
      entity.tenant_id = tenantId;
    }
    return this.repository.save(entity as any);
  }

  async update(id: string, updateData: Partial<T>): Promise<void> {
    const tenantId = this.getTenantId();
    const where: any = { id };
    if (tenantId) {
      where.tenant_id = tenantId;
    }
    await this.repository.update(where, updateData as any);
  }

  async delete(id: string): Promise<void> {
    const tenantId = this.getTenantId();
    const where: any = { id };
    if (tenantId) {
      where.tenant_id = tenantId;
    }
    await this.repository.delete(where);
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    const scopedOptions = options ? this.addTenantScopeToOptions(options) : { where: { tenant_id: this.getTenantId() } };
    return this.repository.count(scopedOptions as FindManyOptions<T>);
  }

  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    const queryBuilder = this.repository.createQueryBuilder(alias);
    return this.addTenantScope(queryBuilder);
  }

  getRepository(): Repository<T> {
    return this.repository;
  }
}