import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { TenantScopedRepository, TenantScopedEntity } from '../repositories/tenant-scoped.repository';

@Injectable({ scope: Scope.REQUEST })
export abstract class TenantScopedService<T extends TenantScopedEntity> {
  protected tenantScopedRepository: TenantScopedRepository<T>;

  constructor(
    repository: Repository<T>,
    @Inject(REQUEST) private request: Request,
  ) {
    this.tenantScopedRepository = new TenantScopedRepository(repository, request);
  }

  protected gettenant_id(): string | undefined {
    return this.request.tenant_id;
  }

  protected getTenant() {
    return this.request.tenant;
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.tenantScopedRepository.find(options);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.tenantScopedRepository.findOne(options);
  }

  async findById(id: string): Promise<T | null> {
    return this.tenantScopedRepository.findById(id);
  }

  async create(createData: Partial<T>): Promise<T> {
    return this.tenantScopedRepository.save(createData);
  }

  async update(id: string, updateData: Partial<T>): Promise<T | null> {
    await this.tenantScopedRepository.update(id, updateData);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.tenantScopedRepository.delete(id);
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.tenantScopedRepository.count(options);
  }

  protected getRepository(): Repository<T> {
    return this.tenantScopedRepository.getRepository();
  }

  protected createQueryBuilder(alias?: string) {
    return this.tenantScopedRepository.createQueryBuilder(alias);
  }
}