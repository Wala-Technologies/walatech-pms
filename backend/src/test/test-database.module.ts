import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestDataSource } from './test-data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...TestDataSource.options,
      autoLoadEntities: true,
    }),
  ],
  exports: [TypeOrmModule],
})
export class TestDatabaseModule {}