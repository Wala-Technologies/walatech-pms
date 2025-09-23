import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../../../entities/item.entity';
import { Bin } from '../entities/bin.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { Batch } from '../entities/batch.entity';
import { SerialNo } from '../entities/serial-no.entity';
import { StockEntry } from '../entities/stock-entry.entity';
import { StockEntryDetail } from '../entities/stock-entry-detail.entity';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StockTransactionValidation {
  itemCode: string;
  warehouse: string;
  qty: number;
  rate?: number;
  batchNo?: string;
  serialNos?: string[];
  transactionType: 'IN' | 'OUT' | 'TRANSFER';
}

@Injectable()
export class InventoryValidationService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Bin)
    private binRepository: Repository<Bin>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(SerialNo)
    private serialNoRepository: Repository<SerialNo>,
    @InjectRepository(StockEntry)
    private stockEntryRepository: Repository<StockEntry>,
    @InjectRepository(StockEntryDetail)
    private stockEntryDetailRepository: Repository<StockEntryDetail>,
  ) {}

  /**
   * Validate stock transaction before processing
   */
  async validateStockTransaction(
    transaction: StockTransactionValidation,
    tenant_id: string,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate item exists and is active
      const item = await this.itemRepository.findOne({
        where: { code: transaction.itemCode },
        relations: ['tenant'],
      });

      if (!item) {
        errors.push(`Item ${transaction.itemCode} does not exist`);
        return { isValid: false, errors, warnings };
      }

      if (item.status !== 'Active') {
        errors.push(`Item ${transaction.itemCode} is not active`);
      }

      // Validate warehouse exists and is active
      const warehouse = await this.warehouseRepository.findOne({
        where: { name: transaction.warehouse, tenant_id },
      });

      if (!warehouse) {
        errors.push(`Warehouse ${transaction.warehouse} does not exist`);
        return { isValid: false, errors, warnings };
      }

      if (!warehouse.is_active) {
        errors.push(`Warehouse ${transaction.warehouse} is not active`);
      }

      // Validate quantity
      if (transaction.qty <= 0) {
        errors.push('Quantity must be greater than zero');
      }

      // Validate rate for incoming transactions
      if (transaction.transactionType === 'IN' && (!transaction.rate || transaction.rate <= 0)) {
        errors.push('Rate must be specified and greater than zero for incoming transactions');
      }

      // Check if item maintains stock
      if (!item.isMaintainStock && transaction.transactionType !== 'IN') {
        warnings.push(`Item ${transaction.itemCode} does not maintain stock`);
      }

      // Validate negative stock for outgoing transactions
      if (transaction.transactionType === 'OUT' || transaction.transactionType === 'TRANSFER') {
        const negativeStockValidation = await this.validateNegativeStock(
          transaction.itemCode,
          transaction.warehouse,
          transaction.qty,
          tenant_id,
        );
        errors.push(...negativeStockValidation.errors);
        warnings.push(...negativeStockValidation.warnings);
      }

      // Validate batch tracking
      if (item.hasBatchNo) {
        const batchValidation = await this.validateBatchTransaction(
          transaction,
          item,
          tenant_id,
        );
        errors.push(...batchValidation.errors);
        warnings.push(...batchValidation.warnings);
      }

      // Validate serial number tracking
      if (item.hasSerialNo) {
        const serialValidation = await this.validateSerialTransaction(
          transaction,
          item,
          tenant_id,
        );
        errors.push(...serialValidation.errors);
        warnings.push(...serialValidation.warnings);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Validate negative stock scenarios
   */
  async validateNegativeStock(
    itemCode: string,
    warehouse: string,
    requestedQty: number,
    tenant_id: string,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const item = await this.itemRepository.findOne({
      where: { code: itemCode, tenant: { id: tenant_id } },
    });

    if (!item) {
      errors.push(`Item ${itemCode} not found`);
      return { isValid: false, errors, warnings };
    }

    const bin = await this.binRepository.findOne({
      where: { itemCode, warehouse_id: warehouse, tenant_id },
    });

    const availableQty = bin?.actualQty || 0;
    const projectedQty = bin?.projectedQty || 0;

    // Check if sufficient stock is available
    if (availableQty < requestedQty) {
      if (item.allowNegativeStock) {
        warnings.push(
          `Insufficient stock for ${itemCode} in ${warehouse}. Available: ${availableQty}, Requested: ${requestedQty}`,
        );
      } else {
        errors.push(
          `Insufficient stock for ${itemCode} in ${warehouse}. Available: ${availableQty}, Requested: ${requestedQty}`,
        );
      }
    }

    // Check projected stock for future transactions
    if (projectedQty < requestedQty) {
      warnings.push(
        `Transaction will result in negative projected stock for ${itemCode} in ${warehouse}`,
      );
    }

    // Check safety stock levels
    if (item.safetyStock && (availableQty - requestedQty) < item.safetyStock) {
      warnings.push(
        `Transaction will bring stock below safety level for ${itemCode} in ${warehouse}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate batch-related transactions
   */
  async validateBatchTransaction(
    transaction: StockTransactionValidation,
    item: Item,
    tenant_id: string,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!transaction.batchNo) {
      errors.push(`Batch number is required for item ${transaction.itemCode}`);
      return { isValid: false, errors, warnings };
    }

    const batch = await this.batchRepository.findOne({
      where: {
        batchId: transaction.batchNo,
        itemCode: transaction.itemCode,
        tenant_id,
      },
    });

    if (transaction.transactionType === 'OUT' || transaction.transactionType === 'TRANSFER') {
      if (!batch) {
        errors.push(`Batch ${transaction.batchNo} not found for item ${transaction.itemCode}`);
        return { isValid: false, errors, warnings };
      }

      // Check batch quantity
      if (batch.batchQty < transaction.qty) {
        errors.push(
          `Insufficient quantity in batch ${transaction.batchNo}. Available: ${batch.batchQty}, Requested: ${transaction.qty}`,
        );
      }

      // Check expiry date
      if (item.hasExpiryDate && batch.expiryDate) {
        const today = new Date();
        if (batch.expiryDate < today) {
          errors.push(`Batch ${transaction.batchNo} has expired on ${batch.expiryDate}`);
        } else {
          const daysToExpiry = Math.ceil(
            (batch.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (daysToExpiry <= 30) {
            warnings.push(
              `Batch ${transaction.batchNo} will expire in ${daysToExpiry} days`,
            );
          }
        }
      }
    } else if (transaction.transactionType === 'IN') {
      // For incoming transactions, batch should either exist or be creatable
      if (batch && batch.batchQty > 0) {
        warnings.push(
          `Adding to existing batch ${transaction.batchNo} with current quantity ${batch.batchQty}`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate serial number transactions
   */
  async validateSerialTransaction(
    transaction: StockTransactionValidation,
    item: Item,
    tenant_id: string,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!transaction.serialNos || transaction.serialNos.length === 0) {
      errors.push(`Serial numbers are required for item ${transaction.itemCode}`);
      return { isValid: false, errors, warnings };
    }

    if (transaction.serialNos.length !== transaction.qty) {
      errors.push(
        `Number of serial numbers (${transaction.serialNos.length}) must match quantity (${transaction.qty})`,
      );
    }

    // Check for undefined serialNos
    const duplicates = transaction.serialNos.filter(
      (serial, index) => transaction.serialNos!.indexOf(serial) !== index,
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate serial numbers found: ${duplicates.join(', ')}`);
    }

    // Validate each serial number
    for (const serialNo of transaction.serialNos) {
      const existingSerial = await this.serialNoRepository.findOne({
        where: { name: serialNo, tenant_id },
      });

      if (transaction.transactionType === 'IN') {
        if (existingSerial && existingSerial.status === 'Active') {
          errors.push(`Serial number ${serialNo} already exists and is active`);
        }
      } else {
        if (!existingSerial) {
          errors.push(`Serial number ${serialNo} not found`);
        } else {
          if (existingSerial.itemCode !== transaction.itemCode) {
            errors.push(
              `Serial number ${serialNo} belongs to item ${existingSerial.itemCode}, not ${transaction.itemCode}`,
            );
          }
          if (existingSerial.warehouseId !== transaction.warehouse) {
            errors.push(
              `Serial number ${serialNo} is in warehouse ${existingSerial.warehouseId}, not ${transaction.warehouse}`,
            );
          }
          if (existingSerial.status !== 'Active') {
            errors.push(`Serial number ${serialNo} is not active`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate stock entry before submission
   */
  async validateStockEntry(
    stockEntryId: string,
    tenant_id: string,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const stockEntry = await this.stockEntryRepository.findOne({
      where: { id: stockEntryId, tenant_id },
      relations: ['items'],
    });

    if (!stockEntry) {
      errors.push('Stock entry not found');
      return { isValid: false, errors, warnings };
    }

    if (stockEntry.docstatus !== 0) {
      errors.push('Only draft stock entries can be validated');
      return { isValid: false, errors, warnings };
    }

    if (!stockEntry.items || stockEntry.items.length === 0) {
      errors.push('Stock entry must have at least one item');
      return { isValid: false, errors, warnings };
    }

    // Validate each stock entry detail
    for (const detail of stockEntry.items) {
      const transaction: StockTransactionValidation = {
        itemCode: detail.itemCode,
        warehouse: detail.sWarehouse,
        qty: detail.qty,
        rate: detail.basicRate,
        batchNo: detail.batchNo,
        serialNos: detail.serialNo ? detail.serialNo.split(',') : undefined,
        transactionType: this.getTransactionType(stockEntry.stockEntryType, detail),
      };

      const validation = await this.validateStockTransaction(transaction, tenant_id);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    }

    // Validate business rules specific to stock entry type
    const businessRuleValidation = await this.validateStockEntryBusinessRules(
      stockEntry,
      tenant_id,
    );
    errors.push(...businessRuleValidation.errors);
    warnings.push(...businessRuleValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate business rules for different stock entry types
   */
  private async validateStockEntryBusinessRules(
    stockEntry: StockEntry,
    tenant_id: string,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (stockEntry.stockEntryType) {
      case 'Material Transfer':
        if (!stockEntry.fromWarehouse || !stockEntry.toWarehouse) {
          errors.push('Both source and target warehouses are required for material transfer');
        }
        if (stockEntry.fromWarehouse === stockEntry.toWarehouse) {
          errors.push('Source and target warehouses cannot be the same');
        }
        break;

      case 'Material Issue':
        if (!stockEntry.fromWarehouse) {
          errors.push('Source warehouse is required for material issue');
        }
        break;

      case 'Material Receipt':
        if (!stockEntry.toWarehouse) {
          errors.push('Target warehouse is required for material receipt');
        }
        break;

      case 'Manufacture':
        // Validate manufacturing-specific rules
        if (!stockEntry.workOrder) {
          warnings.push('Work order reference is recommended for manufacturing entries');
        }
        break;

      case 'Repack':
        // Validate repack-specific rules
        const incomingItems = stockEntry.items.filter(d => d.qty > 0);
        const outgoingItems = stockEntry.items.filter(d => d.qty < 0);
        
        if (incomingItems.length === 0 || outgoingItems.length === 0) {
          errors.push('Repack entries must have both incoming and outgoing items');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get transaction type based on stock entry type and detail
   */
  private getTransactionType(
    stockEntryType: string,
    detail: StockEntryDetail,
  ): 'IN' | 'OUT' | 'TRANSFER' {
    if (stockEntryType === 'Material Transfer') {
      return 'TRANSFER';
    }
    return detail.qty > 0 ? 'IN' : 'OUT';
  }

  /**
   * Validate item configuration for stock operations
   */
  async validateItemConfiguration(
    itemCode: string,
    tenant_id: string,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const item = await this.itemRepository.findOne({
      where: { code: itemCode, tenant: { id: tenant_id } },
    });

    if (!item) {
      errors.push(`Item ${itemCode} not found`);
      return { isValid: false, errors, warnings };
    }

    // Check required configurations
    if (item.isMaintainStock) {
      if (!item.stockUom) {
        errors.push('Stock UOM is required for stock items');
      }
      if (!item.valuationMethod) {
        warnings.push('Valuation method not specified, defaulting to Moving Average');
      }
      if (item.hasBatchNo && item.hasSerialNo) {
        warnings.push('Item has both batch and serial number tracking enabled');
      }
    }

    if (item.hasExpiryDate && !item.hasBatchNo) {
      errors.push('Items with expiry dates must have batch tracking enabled');
    }

    if (item.isFixedAsset && item.isMaintainStock) {
      warnings.push('Fixed assets typically do not maintain stock');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate warehouse configuration
   */
  async validateWarehouseConfiguration(
    warehouseName: string,
    tenant_id: string,
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const warehouse = await this.warehouseRepository.findOne({
      where: { name: warehouseName, tenant_id },
    });

    if (!warehouse) {
      errors.push(`Warehouse ${warehouseName} not found`);
      return { isValid: false, errors, warnings };
    }

    if (!warehouse.is_active) {
      errors.push(`Warehouse ${warehouseName} is not active`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate posting date and time
   */
  validatePostingDateTime(
    postingDate: Date,
    postingTime?: string,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (postingDate > today) {
      errors.push('Posting date cannot be in the future');
    }

    // Check if posting date is too far in the past (configurable)
    const maxBackdateMonths = 12; // This could be a system setting
    const maxBackdate = new Date();
    maxBackdate.setMonth(maxBackdate.getMonth() - maxBackdateMonths);

    if (postingDate < maxBackdate) {
      warnings.push(
        `Posting date is more than ${maxBackdateMonths} months old`,
      );
    }

    if (postingTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!timeRegex.test(postingTime)) {
        errors.push('Invalid posting time format. Use HH:MM:SS');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}