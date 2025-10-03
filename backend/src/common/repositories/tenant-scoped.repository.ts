import {
  Repository,
  SelectQueryBuilder,
  FindManyOptions,
  FindOneOptions,
} from 'typeorm';
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

  private gettenant_id(): string | undefined {
    // Always use tenant_id from request context
    // For super admins, this will be set via x-tenant-subdomain header
    // For regular users, this will be their own tenant_id
    const tenant_id = this.request.tenant_id;
    
    if (!tenant_id) {
      console.warn('[TenantScopedRepository] No tenant_id found in request context');
    }
    
    return tenant_id;
  }

  private addTenantScope(
    queryBuilder: SelectQueryBuilder<T>,
  ): SelectQueryBuilder<T> {
    const tenant_id = this.gettenant_id();
    if (tenant_id) {
      queryBuilder.andWhere(`${queryBuilder.alias}.tenant_id = :tenant_id`, {
        tenant_id,
      });
    }
    return queryBuilder;
  }

  private addTenantScopeToOptions(
    options: FindManyOptions<T> | FindOneOptions<T>,
  ): FindManyOptions<T> | FindOneOptions<T> {
    const tenant_id = this.gettenant_id();
    if (tenant_id) {
      options.where = {
        ...options.where,
        tenant_id: tenant_id as any,
      };
    }
    return options;
  }

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    const scopedOptions = options
      ? this.addTenantScopeToOptions(options)
      : { where: { tenant_id: this.gettenant_id() } };
    return this.repository.find(scopedOptions as FindManyOptions<T>);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    const scopedOptions = this.addTenantScopeToOptions(options);
    return this.repository.findOne(scopedOptions);
  }

  async findById(id: string): Promise<T | null> {
    const tenant_id = this.gettenant_id();
    const where: any = { id };
    if (tenant_id) {
      where.tenant_id = tenant_id;
    }
    return this.repository.findOne({ where });
  }

  async save(entity: Partial<T>): Promise<T> {
    const tenant_id = this.gettenant_id();
    if (tenant_id && !entity.tenant_id) {
      entity.tenant_id = tenant_id;
    }
    return this.repository.save(entity as any);
  }

  async update(id: string, updateData: Partial<T>): Promise<void> {
    const tenant_id = this.gettenant_id();
    const where: any = { id };
    if (tenant_id) {
      where.tenant_id = tenant_id;
    }
    await this.repository.update(where, updateData as any);
  }

  async delete(id: string): Promise<void> {
    const tenant_id = this.gettenant_id();
    const where: any = { id };
    if (tenant_id) {
      where.tenant_id = tenant_id;
    }
    await this.repository.delete(where);
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    const scopedOptions = options
      ? this.addTenantScopeToOptions(options)
      : { where: { tenant_id: this.gettenant_id() } };
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
