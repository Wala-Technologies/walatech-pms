import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '../../entities/item.entity';
import { User } from '../../entities/user.entity';
import { Tenant } from '../../entities/tenant.entity';
import { Department } from '../hr/entities/department.entity';
import { Warehouse } from './entities/warehouse.entity';
import { Bin } from './entities/bin.entity';
import { Batch } from './entities/batch.entity';
import { SerialNo } from './entities/serial-no.entity';
import { StockEntry } from './entities/stock-entry.entity';
import { StockEntryDetail } from './entities/stock-entry-detail.entity';
import { StockLedgerEntry } from './entities/stock-ledger-entry.entity';
import { InventoryController } from './controllers/inventory.controller';
import { WarehouseController } from './controllers/warehouse.controller';
import { StockEntryController } from './controllers/stock-entry.controller';
import { BatchController } from './controllers/batch.controller';
import { SerialNoController } from './controllers/serial-no.controller';
import { BinController } from './controllers/bin.controller';
import { InventoryService } from './services/inventory.service';
import { WarehouseService } from './services/warehouse.service';
import { BinService } from './services/bin.service';
import { StockEntryService } from './services/stock-entry.service';
import { BatchService } from './services/batch.service';
import { SerialNoService } from './services/serial-no.service';
import { DepartmentAccessService } from '../../common/services/department-access.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Item,
      User,
      Tenant,
      Department,
      Warehouse,
      Bin,
      Batch,
      SerialNo,
      StockEntry,
      StockEntryDetail,
      StockLedgerEntry,
    ]),
  ],
  controllers: [InventoryController, WarehouseController, StockEntryController, BatchController, SerialNoController, BinController],
  providers: [InventoryService, WarehouseService, BinService, StockEntryService, BatchService, SerialNoService, DepartmentAccessService],
  exports: [TypeOrmModule, InventoryService, WarehouseService, BinService, StockEntryService, BatchService, SerialNoService],
})
export class InventoryModule {}