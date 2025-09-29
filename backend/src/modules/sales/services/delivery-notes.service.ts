import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Scope,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { DeliveryNote, DeliveryNoteStatus } from '../../../entities/delivery-note.entity';
import { DeliveryNoteItem } from '../../../entities/delivery-note-item.entity';
import { Customer } from '../../../entities/customer.entity';
import { Item } from '../../../entities/item.entity';
import { CreateDeliveryNoteDto } from '../dto/create-delivery-note.dto';
import { UpdateDeliveryNoteDto } from '../dto/update-delivery-note.dto';
import { DepartmentAccessService } from '../../../common/services/department-access.service';

@Injectable({ scope: Scope.REQUEST })
export class DeliveryNotesService {
  constructor(
    @InjectRepository(DeliveryNote)
    private deliveryNoteRepository: Repository<DeliveryNote>,
    @InjectRepository(DeliveryNoteItem)
    private deliveryNoteItemRepository: Repository<DeliveryNoteItem>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    private dataSource: DataSource,
    private readonly departmentAccessService: DepartmentAccessService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(
    createDeliveryNoteDto: CreateDeliveryNoteDto,
    tenant_id: string,
    userId: string,
  ): Promise<DeliveryNote> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate customer exists
      const customer = await this.customerRepository.findOne({
        where: { id: createDeliveryNoteDto.customer, tenant_id: tenant_id },
      });

      if (!customer) {
        throw new NotFoundException(
          `Customer with ID ${createDeliveryNoteDto.customer} not found`,
        );
      }

      // Validate all items exist
      for (const itemDto of createDeliveryNoteDto.items) {
        const item = await this.itemRepository.findOne({
          where: { code: itemDto.item_code, tenant_id: tenant_id },
        });

        if (!item) {
          throw new NotFoundException(
            `Item with code ${itemDto.item_code} not found`,
          );
        }
      }

      // Generate delivery note name
      const deliveryNoteName = await this.generateDeliveryNoteName(tenant_id, queryRunner);

      // Calculate totals
      const totals = this.calculateTotals(createDeliveryNoteDto.items);

      // Create delivery note
      const { customer: customerId, items, ...deliveryNoteData } = createDeliveryNoteDto;
      const deliveryNote = this.deliveryNoteRepository.create({
        ...deliveryNoteData,
        name: deliveryNoteName,
        tenant_id: tenant_id,
        created_by: userId,
        modified_by: userId,
        customer_id: customerId,
        customer_name: customer.customer_name,
        posting_date: createDeliveryNoteDto.posting_date || new Date().toISOString().split('T')[0],
        posting_time: createDeliveryNoteDto.posting_time || new Date().toTimeString().split(' ')[0],
        status: createDeliveryNoteDto.status || 'Draft',
        docstatus: 0,
        ...totals,
      });

      const savedDeliveryNote = await queryRunner.manager.save(deliveryNote) as unknown as DeliveryNote;

      // Create delivery note items
      const deliveryNoteItems = createDeliveryNoteDto.items.map((itemDto, index) => {
        const stockQty = (itemDto.qty || 0) * (itemDto.conversion_factor || 1);
        const amount = (itemDto.qty || 0) * (itemDto.rate || 0);
        const netAmount = amount - (itemDto.discount_amount || 0);

        return this.deliveryNoteItemRepository.create({
          ...itemDto,
          name: `${deliveryNoteName}-${index + 1}`,
          delivery_note_id: savedDeliveryNote.id,
          tenant_id: tenant_id,
          created_by: userId,
          modified_by: userId,
          stock_qty: stockQty,
          amount: amount,
          net_amount: netAmount,
          base_amount: amount * (createDeliveryNoteDto.conversion_rate || 1),
          base_net_amount: netAmount * (createDeliveryNoteDto.conversion_rate || 1),
          docstatus: 0,
          idx: index + 1,
        });
      });

      await queryRunner.manager.save(deliveryNoteItems);

      await queryRunner.commitTransaction();

      return this.findOne(savedDeliveryNote.id, tenant_id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    tenant_id: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    customer?: string,
  ): Promise<{ data: DeliveryNote[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.deliveryNoteRepository
      .createQueryBuilder('dn')
      .leftJoinAndSelect('dn.items', 'items')
      .leftJoinAndSelect('dn.customer_rel', 'customer')
      .where('dn.tenant_id = :tenant_id', { tenant_id })
      .orderBy('dn.created_at', 'DESC');

    // Apply department-based filtering
    const user = this.request.user;
    if (user && !this.departmentAccessService.canAccessAllDepartments(user)) {
      const accessibleDepartments = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartments && accessibleDepartments.length > 0) {
        queryBuilder.andWhere('dn.department_id IN (:...departmentIds)', {
          departmentIds: accessibleDepartments,
        });
      } else {
        // User has no department access, return empty result
        return { data: [], total: 0, page, limit };
      }
    }

    if (search) {
      queryBuilder.andWhere(
        '(dn.name LIKE :search OR dn.customer_name LIKE :search OR customer.customer_name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('dn.status = :status', { status });
    }

    if (customer) {
      queryBuilder.andWhere('dn.customer = :customer', { customer });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, tenant_id: string, userId: string): Promise<DeliveryNote> {
    const deliveryNote = await this.deliveryNoteRepository.findOne({
      where: { id, tenant_id: tenant_id },
      relations: ['items', 'customer_rel', 'tenant'],
    });

    if (!deliveryNote) {
      throw new NotFoundException(`Delivery Note with ID ${id} not found`);
    }

    // Check if user has access to the delivery note's department
    if (deliveryNote.department_id && this.request.user) {
      const hasAccess = this.departmentAccessService.canAccessDepartment(this.request.user, deliveryNote.department_id);
      if (!hasAccess) {
        throw new NotFoundException(`Delivery Note with ID ${id} not found`);
      }
    }

    return deliveryNote;
  }

  async update(
    id: string,
    updateDeliveryNoteDto: UpdateDeliveryNoteDto,
    tenant_id: string,
    userId: string,
  ): Promise<DeliveryNote> {
    const deliveryNote = await this.findOne(id, tenant_id, userId);

    if (deliveryNote.docstatus === 1) {
      throw new BadRequestException('Cannot update submitted delivery note');
    }

    if (deliveryNote.docstatus === 2) {
      throw new BadRequestException('Cannot update cancelled delivery note');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate customer if provided
      if (updateDeliveryNoteDto.customer) {
        const customer = await this.customerRepository.findOne({
          where: { id: updateDeliveryNoteDto.customer, tenant_id: tenant_id },
        });

        if (!customer) {
          throw new NotFoundException(
            `Customer with ID ${updateDeliveryNoteDto.customer} not found`,
          );
        }
        updateDeliveryNoteDto.customer_name = customer.customer_name;
      }

      // Update items if provided
      if (updateDeliveryNoteDto.items) {
        // Validate all items exist
        for (const itemDto of updateDeliveryNoteDto.items) {
          const item = await this.itemRepository.findOne({
            where: { code: itemDto.item_code, tenant_id: tenant_id },
          });

          if (!item) {
            throw new NotFoundException(
              `Item with code ${itemDto.item_code} not found`,
            );
          }
        }

        // Delete existing items
        await queryRunner.manager.delete(DeliveryNoteItem, {
          delivery_note_id: id,
          tenant_id: tenant_id,
        });

        // Create new items
        const deliveryNoteItems = updateDeliveryNoteDto.items.map((itemDto, index) => {
          const stockQty = (itemDto.qty || 0) * (itemDto.conversion_factor || 1);
          const amount = (itemDto.qty || 0) * (itemDto.rate || 0);
          const netAmount = amount - (itemDto.discount_amount || 0);

          return this.deliveryNoteItemRepository.create({
            ...itemDto,
            name: `${deliveryNote.name}-${index + 1}`,
            delivery_note_id: id,
            tenant_id: tenant_id,
            created_by: userId,
            modified_by: userId,
            stock_qty: stockQty,
            amount: amount,
            net_amount: netAmount,
            base_amount: amount * (updateDeliveryNoteDto.conversion_rate || deliveryNote.conversion_rate || 1),
            base_net_amount: netAmount * (updateDeliveryNoteDto.conversion_rate || deliveryNote.conversion_rate || 1),
            docstatus: 0,
            idx: index + 1,
          });
        });

        await queryRunner.manager.save(deliveryNoteItems);

        // Recalculate totals
        const totals = this.calculateTotals(updateDeliveryNoteDto.items);
        Object.assign(updateDeliveryNoteDto, totals);
      }

      // Update delivery note
      const { customer, items, ...updateData } = updateDeliveryNoteDto;
      const updatePayload: any = {
        ...updateData,
        modified_by: userId,
        modified: new Date(),
      };
      
      if (customer) {
        updatePayload.customer_id = customer;
      }
      
      await queryRunner.manager.update(
        DeliveryNote,
        { id, tenant_id: tenant_id },
        updatePayload,
      );

      await queryRunner.commitTransaction();

      return this.findOne(id, tenant_id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, tenant_id: string, userId: string): Promise<void> {
    const deliveryNote = await this.findOne(id, tenant_id, userId);

    if (deliveryNote.docstatus === 1) {
      throw new BadRequestException('Cannot delete submitted delivery note');
    }

    await this.deliveryNoteRepository.delete({ id, tenant_id: tenant_id });
  }

  async submit(id: string, tenant_id: string, userId: string): Promise<DeliveryNote> {
    const deliveryNote = await this.findOne(id, tenant_id, userId);

    if (deliveryNote.docstatus !== 0) {
      throw new BadRequestException('Only draft delivery notes can be submitted');
    }

    if (!deliveryNote.items || deliveryNote.items.length === 0) {
      throw new BadRequestException('Cannot submit delivery note without items');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update delivery note status
      await queryRunner.manager.update(
        DeliveryNote,
        { id, tenant_id: tenant_id },
        {
          docstatus: 1,
          status: DeliveryNoteStatus.TO_BILL,
          modified_by: userId,
          modified: new Date(),
        },
      );

      // Update items status
      await queryRunner.manager.update(
        DeliveryNoteItem,
        { delivery_note_id: id, tenant_id: tenant_id },
        {
          docstatus: 1,
          modified_by: userId,
          modified: new Date(),
        },
      );

      // TODO: Create stock ledger entries for inventory tracking
      // This would integrate with the inventory module to track stock movements

      await queryRunner.commitTransaction();

      return this.findOne(id, tenant_id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: string, tenant_id: string, userId: string): Promise<DeliveryNote> {
    const deliveryNote = await this.findOne(id, tenant_id, userId);

    if (deliveryNote.docstatus !== 1) {
      throw new BadRequestException('Only submitted delivery notes can be cancelled');
    }

    if (deliveryNote.per_billed && deliveryNote.per_billed > 0) {
      throw new BadRequestException('Cannot cancel delivery note that has been billed');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update delivery note status
      await queryRunner.manager.update(
        DeliveryNote,
        { id, tenant_id: tenant_id },
        {
          docstatus: 2,
          status: DeliveryNoteStatus.CANCELLED,
          modified_by: userId,
          modified: new Date(),
        },
      );

      // Update items status
      await queryRunner.manager.update(
        DeliveryNoteItem,
        { delivery_note_id: id, tenant_id: tenant_id },
        {
          docstatus: 2,
          modified_by: userId,
          modified: new Date(),
        },
      );

      // TODO: Reverse stock ledger entries
      // This would integrate with the inventory module to reverse stock movements

      await queryRunner.commitTransaction();

      return this.findOne(id, tenant_id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getDeliveryNoteSummary(tenant_id: string): Promise<any> {
    const summary = await this.deliveryNoteRepository
      .createQueryBuilder('dn')
      .select([
        'dn.status',
        'COUNT(*) as count',
        'SUM(dn.grand_total) as total_amount',
      ])
      .where('dn.tenant_id = :tenant_id', { tenant_id })
      .groupBy('dn.status')
      .getRawMany();

    const totalDeliveryNotes = await this.deliveryNoteRepository.count({
      where: { tenant_id: tenant_id },
    });

    return {
      total_delivery_notes: totalDeliveryNotes,
      by_status: summary,
    };
  }

  private async generateDeliveryNoteName(
    tenant_id: string,
    queryRunner: QueryRunner,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `DN-${year}-`;

    const lastDeliveryNote = await queryRunner.manager
      .createQueryBuilder(DeliveryNote, 'dn')
      .where('dn.tenant_id = :tenant_id', { tenant_id })
      .andWhere('dn.name LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('dn.name', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastDeliveryNote) {
      const lastNumber = parseInt(lastDeliveryNote.name.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  private calculateTotals(items: any[]): any {
    const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);
    const baseTotal = items.reduce((sum, item) => {
      const amount = (item.qty || 0) * (item.rate || 0);
      return sum + amount;
    }, 0);

    const totalDiscountAmount = items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
    const baseNetTotal = baseTotal - totalDiscountAmount;

    return {
      total_qty: totalQty,
      base_total: baseTotal,
      base_net_total: baseNetTotal,
      total: baseTotal,
      net_total: baseNetTotal,
      base_grand_total: baseNetTotal,
      grand_total: baseNetTotal,
      base_rounded_total: Math.round(baseNetTotal),
      rounded_total: Math.round(baseNetTotal),
    };
  }
}