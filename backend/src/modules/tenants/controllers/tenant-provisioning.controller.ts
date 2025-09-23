import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantProvisioningService, TenantProvisioningResult } from '../services/tenant-provisioning.service';
import { ProvisionTenantDto } from '../dto/provision-tenant.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('tenant-provisioning')
@Controller('tenant-provisioning')
export class TenantProvisioningController {
  constructor(
    private readonly tenantProvisioningService: TenantProvisioningService,
  ) {}

  @Post('provision')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Provision a new tenant with admin user' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tenant provisioned successfully',
    schema: {
      type: 'object',
      properties: {
        tenant: {
          type: 'object',
          description: 'Created tenant information'
        },
        adminUser: {
          type: 'object',
          description: 'Created admin user information'
        },
        setupComplete: {
          type: 'boolean',
          description: 'Whether the setup completed successfully'
        },
        message: {
          type: 'string',
          description: 'Success message'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiResponse({ status: 409, description: 'Conflict - subdomain or email already exists' })
  async provisionTenant(
    @Body() provisionDto: ProvisionTenantDto,
  ): Promise<TenantProvisioningResult> {
    return this.tenantProvisioningService.provisionTenant(provisionDto);
  }

  @Get(':tenant_id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenant provisioning status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenant provisioning status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        tenant: {
          type: 'object',
          description: 'Tenant information'
        },
        userCount: {
          type: 'number',
          description: 'Number of users in the tenant'
        },
        isFullyProvisioned: {
          type: 'boolean',
          description: 'Whether the tenant is fully provisioned'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getTenantProvisioningStatus(@Param('tenant_id') tenant_id: string) {
    return this.tenantProvisioningService.getTenantProvisioningStatus(tenant_id);
  }

  @Delete(':tenant_id/deprovision')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deprovision a tenant (suspend and cleanup)' })
  @ApiResponse({ status: 204, description: 'Tenant deprovisioned successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async deprovisionTenant(@Param('tenant_id') tenant_id: string): Promise<void> {
    return this.tenantProvisioningService.deprovisionTenant(tenant_id);
  }
}