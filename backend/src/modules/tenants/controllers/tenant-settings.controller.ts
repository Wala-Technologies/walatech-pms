import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantSettingsService, TenantSettings } from '../services/tenant-settings.service';
import type { UpdateTenantSettingsDto } from '../services/tenant-settings.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUsertenant_id } from '../../../decorators/current-user.decorator';

@ApiTags('tenant-settings')
@Controller('tenant-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantSettingsController {
  constructor(
    private readonly tenantSettingsService: TenantSettingsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current tenant settings' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenant settings retrieved successfully',
    schema: {
      type: 'object',
      description: 'Tenant settings object with all configuration options'
    }
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 403, description: 'Tenant is not active' })
  async getTenantSettings(
    @CurrentUsertenant_id() tenant_id: string,
  ): Promise<TenantSettings> {
    return this.tenantSettingsService.getTenantSettings(tenant_id);
  }

  @Put()
  @ApiOperation({ summary: 'Update tenant settings' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenant settings updated successfully',
    schema: {
      type: 'object',
      description: 'Updated tenant settings object'
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid settings data' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 403, description: 'Tenant is not active' })
  async updateTenantSettings(
    @CurrentUsertenant_id() tenant_id: string,
    @Body() updateDto: UpdateTenantSettingsDto,
  ): Promise<TenantSettings> {
    return this.tenantSettingsService.updateTenantSettings(tenant_id, updateDto);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset tenant settings to defaults' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenant settings reset to defaults successfully',
    schema: {
      type: 'object',
      description: 'Default tenant settings object'
    }
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 403, description: 'Tenant is not active' })
  async resetTenantSettings(
    @CurrentUsertenant_id() tenant_id: string,
  ): Promise<TenantSettings> {
    return this.tenantSettingsService.resetTenantSettings(tenant_id);
  }

  @Get('setting/:path')
  @ApiOperation({ summary: 'Get specific setting value by path' })
  @ApiResponse({ 
    status: 200, 
    description: 'Setting value retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Setting path' },
        value: { description: 'Setting value' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tenant or setting not found' })
  async getSettingValue(
    @CurrentUsertenant_id() tenant_id: string,
    @Param('path') path: string,
  ): Promise<{ path: string; value: any }> {
    const value = await this.tenantSettingsService.getSettingValue(tenant_id, path);
    return { path, value };
  }

  @Put('setting/:path')
  @ApiOperation({ summary: 'Update specific setting value by path' })
  @ApiResponse({ 
    status: 200, 
    description: 'Setting updated successfully',
    schema: {
      type: 'object',
      description: 'Updated tenant settings object'
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid setting value' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async updateSettingValue(
    @CurrentUsertenant_id() tenant_id: string,
    @Param('path') path: string,
    @Body() body: { value: any },
  ): Promise<TenantSettings> {
    return this.tenantSettingsService.updateSettingValue(tenant_id, path, body.value);
  }
}