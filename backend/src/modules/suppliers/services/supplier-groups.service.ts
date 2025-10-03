import { Injectable, NotFoundException, ConflictException, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { SupplierGroup } from '../../../entities/supplier-group.entity';
import { CreateSupplierGroupDto } from '../dto/create-supplier-group.dto';
import { UpdateSupplierGroupDto } from '../dto/update-supplier-group.dto';

@Injectable({ scope: Scope.REQUEST })
export class SupplierGroupsService {
  constructor(
    @InjectRepository(SupplierGroup)
    private supplierGroupRepository: Repository<SupplierGroup>,
    @Inject(REQUEST) private request: any,
  ) {}

  private get tenant_id(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  async create(createSupplierGroupDto: CreateSupplierGroupDto): Promise<SupplierGroup> {
    // Check if supplier group with same name already exists for this tenant
    const existingGroup = await this.supplierGroupRepository.findOne({
      where: {
        supplier_group_name: createSupplierGroupDto.supplier_group_name,
        tenant_id: this.tenant_id,
      },
    });

    if (existingGroup) {
      throw new ConflictException('Supplier group with this name already exists');
    }

    // Validate parent group if provided
    let parentGroup: SupplierGroup | null = null;
    if (createSupplierGroupDto.parent_supplier_group) {
      parentGroup = await this.supplierGroupRepository.findOne({
        where: {
          id: createSupplierGroupDto.parent_supplier_group,
          tenant_id: this.tenant_id,
        },
      });

      if (!parentGroup) {
        throw new NotFoundException('Parent supplier group not found');
      }

      // Ensure parent is marked as a group
      if (!parentGroup.is_group) {
        parentGroup.is_group = true;
        await this.supplierGroupRepository.save(parentGroup);
      }
    }

    const supplierGroup = this.supplierGroupRepository.create({
      ...createSupplierGroupDto,
      tenant_id: this.tenant_id,
      owner: this.request.user?.email || 'system',
      parent_supplier_group: parentGroup?.id || null,
    });

    return this.supplierGroupRepository.save(supplierGroup);
  }

  async findAll(): Promise<SupplierGroup[]> {
    return this.supplierGroupRepository.find({
      where: { tenant_id: this.tenant_id },
      order: { supplier_group_name: 'ASC' },
    });
  }

  async findTree(): Promise<SupplierGroup[]> {
    // Get all groups for the tenant
    const allGroups = await this.supplierGroupRepository.find({
      where: { tenant_id: this.tenant_id },
      order: { supplier_group_name: 'ASC' },
    });

    // Build tree structure
    const groupMap = new Map<string, SupplierGroup & { children?: SupplierGroup[] }>();
    const rootGroups: (SupplierGroup & { children?: SupplierGroup[] })[] = [];

    // First pass: create map and initialize children arrays
    allGroups.forEach(group => {
      const groupWithChildren = { ...group, children: [] };
      groupMap.set(group.id, groupWithChildren);
    });

    // Second pass: build tree structure
    allGroups.forEach(group => {
      const groupWithChildren = groupMap.get(group.id)!;
      
      if (group.parent_supplier_group) {
        const parent = groupMap.get(group.parent_supplier_group);
        if (parent) {
          parent.children!.push(groupWithChildren);
        } else {
          // Parent not found in current tenant, treat as root
          rootGroups.push(groupWithChildren);
        }
      } else {
        rootGroups.push(groupWithChildren);
      }
    });

    return rootGroups;
  }

  async findOne(id: string): Promise<SupplierGroup> {
    const supplierGroup = await this.supplierGroupRepository.findOne({
      where: { id, tenant_id: this.tenant_id },
      relations: ['suppliers'],
    });

    if (!supplierGroup) {
      throw new NotFoundException('Supplier group not found');
    }

    return supplierGroup;
  }

  async findChildren(parentId: string): Promise<SupplierGroup[]> {
    return this.supplierGroupRepository.find({
      where: {
        parent_supplier_group: parentId,
        tenant_id: this.tenant_id,
      },
      order: { supplier_group_name: 'ASC' },
    });
  }

  async update(id: string, updateSupplierGroupDto: UpdateSupplierGroupDto): Promise<SupplierGroup> {
    const supplierGroup = await this.findOne(id);

    // Check if name is being updated and is unique
    if (updateSupplierGroupDto.supplier_group_name && 
        updateSupplierGroupDto.supplier_group_name !== supplierGroup.supplier_group_name) {
      const existingGroup = await this.supplierGroupRepository.findOne({
        where: {
          supplier_group_name: updateSupplierGroupDto.supplier_group_name,
          tenant_id: this.tenant_id,
        },
      });

      if (existingGroup && existingGroup.id !== id) {
        throw new ConflictException('Supplier group with this name already exists');
      }
    }

    // Validate parent group if being updated
    if (updateSupplierGroupDto.parent_supplier_group) {
      // Prevent circular reference
      if (updateSupplierGroupDto.parent_supplier_group === id) {
        throw new ConflictException('A group cannot be its own parent');
      }

      const parentGroup = await this.supplierGroupRepository.findOne({
        where: {
          id: updateSupplierGroupDto.parent_supplier_group,
          tenant_id: this.tenant_id,
        },
      });

      if (!parentGroup) {
        throw new NotFoundException('Parent supplier group not found');
      }

      // Check for circular reference in the hierarchy
      const isCircular = await this.checkCircularReference(id, updateSupplierGroupDto.parent_supplier_group);
      if (isCircular) {
        throw new ConflictException('Circular reference detected in group hierarchy');
      }

      // Ensure parent is marked as a group
      if (!parentGroup.is_group) {
        parentGroup.is_group = true;
        await this.supplierGroupRepository.save(parentGroup);
      }
    }

    Object.assign(supplierGroup, updateSupplierGroupDto);
    supplierGroup.modified_by = this.request.user?.email || 'system';

    return this.supplierGroupRepository.save(supplierGroup);
  }

  async remove(id: string): Promise<void> {
    try {
      const supplierGroup = await this.findOne(id);

      // Check if group has children
      const children = await this.findChildren(id);
      if (children.length > 0) {
        throw new ConflictException('Cannot delete group that has child groups');
      }

      // Check if group has suppliers
      console.log('Supplier group suppliers:', supplierGroup.suppliers?.length || 0);
      if (supplierGroup.suppliers && supplierGroup.suppliers.length > 0) {
        throw new ConflictException('Cannot delete group that has suppliers assigned');
      }

      await this.supplierGroupRepository.remove(supplierGroup);
    } catch (error) {
      console.error('Error removing supplier group:', error);
      throw error;
    }
  }

  async getGroupStats(groupId: string): Promise<{
    totalSuppliers: number;
    activeSuppliers: number;
    disabledSuppliers: number;
    childGroups: number;
  }> {
    const group = await this.findOne(groupId);
    const children = await this.findChildren(groupId);

    // Count suppliers directly in this group
    const totalSuppliers = group.suppliers?.length || 0;
    const activeSuppliers = group.suppliers?.filter(s => !s.disabled).length || 0;
    const disabledSuppliers = group.suppliers?.filter(s => s.disabled).length || 0;

    return {
      totalSuppliers,
      activeSuppliers,
      disabledSuppliers,
      childGroups: children.length,
    };
  }

  async moveGroup(groupId: string, newParentId: string | null): Promise<SupplierGroup> {
    const group = await this.findOne(groupId);

    if (newParentId) {
      // Prevent circular reference
      if (newParentId === groupId) {
        throw new ConflictException('A group cannot be its own parent');
      }

      const newParent = await this.supplierGroupRepository.findOne({
        where: {
          id: newParentId,
          tenant_id: this.tenant_id,
        },
      });

      if (!newParent) {
        throw new NotFoundException('New parent group not found');
      }

      // Check for circular reference
      const isCircular = await this.checkCircularReference(groupId, newParentId);
      if (isCircular) {
        throw new ConflictException('Circular reference detected in group hierarchy');
      }

      // Ensure new parent is marked as a group
      if (!newParent.is_group) {
        newParent.is_group = true;
        await this.supplierGroupRepository.save(newParent);
      }
    }

    group.parent_supplier_group = newParentId || null;
    group.modified_by = this.request.user?.email || 'system';

    return this.supplierGroupRepository.save(group);
  }

  private async checkCircularReference(groupId: string, potentialParentId: string): Promise<boolean> {
    let currentParentId: string | null = potentialParentId;

    while (currentParentId) {
      if (currentParentId === groupId) {
        return true; // Circular reference found
      }

      const parent = await this.supplierGroupRepository.findOne({
        where: {
          id: currentParentId,
          tenant_id: this.tenant_id,
        },
      });

      currentParentId = parent?.parent_supplier_group || null;
    }

    return false; // No circular reference
  }

  async getGroupHierarchy(groupId: string): Promise<{
    group: SupplierGroup;
    ancestors: SupplierGroup[];
    descendants: SupplierGroup[];
  }> {
    const group = await this.findOne(groupId);
    
    // Get ancestors
    const ancestors: SupplierGroup[] = [];
    let currentParentId = group.parent_supplier_group;
    
    while (currentParentId) {
      const parent = await this.supplierGroupRepository.findOne({
        where: {
          id: currentParentId,
          tenant_id: this.tenant_id,
        },
      });
      
      if (parent) {
        ancestors.unshift(parent); // Add to beginning to maintain order
        currentParentId = parent.parent_supplier_group;
      } else {
        break;
      }
    }

    // Get all descendants
    const descendants = await this.getAllDescendants(groupId);

    return {
      group,
      ancestors,
      descendants,
    };
  }

  private async getAllDescendants(groupId: string): Promise<SupplierGroup[]> {
    const directChildren = await this.findChildren(groupId);
    const allDescendants: SupplierGroup[] = [...directChildren];

    for (const child of directChildren) {
      const childDescendants = await this.getAllDescendants(child.id);
      allDescendants.push(...childDescendants);
    }

    return allDescendants;
  }
}