import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from '../../entities/supplier.entity';
import { SupplierGroup } from '../../entities/supplier-group.entity';
import { SupplierQuotation, SupplierQuotationItem } from '../../entities/supplier-quotation.entity';
import { SupplierScorecard, SupplierScorecardCriteria, SupplierScorecardPeriod } from '../../entities/supplier-scorecard.entity';
import { Department } from '../hr/entities/department.entity';
import { DepartmentAccessService } from '../../common/services/department-access.service';
import { SuppliersService } from './services/suppliers.service';
import { SupplierGroupsService } from './services/supplier-groups.service';
import { SupplierQuotationsService } from './services/supplier-quotations.service';
import { SupplierScorecardsService } from './services/supplier-scorecards.service';
import { SuppliersController } from './controllers/suppliers.controller';
import { SupplierGroupsController } from './controllers/supplier-groups.controller';
import { SupplierQuotationsController } from './controllers/supplier-quotations.controller';
import { SupplierScorecardsController } from './controllers/supplier-scorecards.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier,
      SupplierGroup,
      SupplierQuotation,
      SupplierQuotationItem,
      SupplierScorecard,
      SupplierScorecardCriteria,
      SupplierScorecardPeriod,
      Department,
    ]),
  ],
  controllers: [
    SuppliersController,
    SupplierGroupsController,
    SupplierQuotationsController,
    SupplierScorecardsController,
  ],
  providers: [
    SuppliersService,
    SupplierGroupsService,
    SupplierQuotationsService,
    SupplierScorecardsService,
    DepartmentAccessService,
  ],
  exports: [
    SuppliersService,
    SupplierGroupsService,
    SupplierQuotationsService,
    SupplierScorecardsService,
  ],
})
export class SuppliersModule {}