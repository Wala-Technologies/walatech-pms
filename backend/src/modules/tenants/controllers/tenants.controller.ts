import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TenantsService } from '../services/tenants.service';
import {
  TenantSettingsService,
  TenantSettings,
} from '../services/tenant-settings.service';
import type { UpdateTenantSettingsDto } from '../services/tenant-settings.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../auth/guards/super-admin.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { TenantPlan } from '../../../entities/tenant.entity';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly tenantSettingsService: TenantSettingsService,
  ) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @UseGuards(SuperAdminGuard)
  findAll() {
    return this.tenantsService.findAll();
  }

  // Removed insecure public endpoint 'admin/all' that exposed all tenants without authentication.
  // Super admin should use guarded GET /tenants instead.

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Get('by-subdomain/:subdomain')
  @Public()
  @ApiOperation({ summary: 'Get tenant by subdomain' })
  @ApiResponse({ status: 200, description: 'Tenant retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.tenantsService.findBySubdomain(subdomain);
  }

  @Get('validate/:subdomain')
  @Public()
  @ApiOperation({ summary: 'Validate tenant subdomain' })
  @ApiResponse({
    status: 200,
    description: 'Tenant validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        status: { type: 'string' },
      },
    },
  })
  async validateTenant(@Param('subdomain') subdomain: string) {
    const tenant = await this.tenantsService.findBySubdomain(subdomain);
    return {
      valid: tenant !== null && tenant.status === 'active',
      status: tenant?.status || 'not_found',
    };
  }

  @Get('user/tenants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tenants for current user' })
  @ApiResponse({
    status: 200,
    description: 'User tenants retrieved successfully',
  })
  async getUserTenants(@CurrentUser() user: { id: string }) {
    return this.tenantsService.findUserTenants(user.id);
  }

  @Patch(':id')
  @UseGuards(SuperAdminGuard)
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @Patch(':id/activate')
  @UseGuards(SuperAdminGuard)
  activate(@Param('id') id: string) {
    return this.tenantsService.activate(id);
  }

  @Patch(':id/suspend')
  @UseGuards(SuperAdminGuard)
  suspend(@Param('id') id: string) {
    return this.tenantsService.suspend(id);
  }

  @Patch(':id/plan')
  @UseGuards(SuperAdminGuard)
  updatePlan(@Param('id') id: string, @Body('plan') plan: TenantPlan) {
    return this.tenantsService.updatePlan(id, plan);
  }

  @Get(':id/settings')
  @ApiOperation({ summary: 'Get tenant settings by ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant settings retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  getTenantSettings(@Param('id') id: string): Promise<TenantSettings> {
    return this.tenantSettingsService.getTenantSettings(id);
  }

  @Put(':id/settings')
  @ApiOperation({ summary: 'Update tenant settings by ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant settings updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  updateTenantSettings(
    @Param('id') id: string,
    @Body() updateDto: UpdateTenantSettingsDto,
  ): Promise<TenantSettings> {
    return this.tenantSettingsService.updateTenantSettings(id, updateDto);
  }

  @Post(':id/settings/reset')
  @ApiOperation({ summary: 'Reset tenant settings to defaults by ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant settings reset successfully',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  resetTenantSettings(@Param('id') id: string): Promise<TenantSettings> {
    return this.tenantSettingsService.resetTenantSettings(id);
  }

  @Post(':id/logo')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (
          req: any,
          file: { originalname: string },
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${req.params.id}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (
        _req: any,
        file: { mimetype: string },
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|svg\+xml)$/)) {
          return cb(null, true);
        }
        return cb(new Error('Only image files are allowed!'), false);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  @ApiOperation({ summary: 'Upload tenant logo' })
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: { filename: string },
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Generate absolute URL for the logo
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || 3001;
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? `${protocol}://${host}`
        : `${protocol}://${host}:${port}`;
    const logoUrl = `${baseUrl}/api/tenants/${id}/logo/${file.filename}`;

    // Update tenant settings with new logo URL
    const currentSettings =
      await this.tenantSettingsService.getTenantSettings(id);
    const updatedSettings = {
      ...currentSettings,
      companyLogo: logoUrl,
    };

    await this.tenantSettingsService.updateTenantSettings(id, {
      settings: updatedSettings,
    });

    return {
      message: 'Logo uploaded successfully',
      logoUrl,
      filename: file.filename,
    };
  }

  @Get(':id/logo/:filename')
  @Public()
  @ApiOperation({ summary: 'Get tenant logo file' })
  @ApiResponse({ status: 200, description: 'Logo file retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Logo file not found' })
  getLogo(
    @Param('id') id: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const logoPath = join(process.cwd(), 'uploads', 'logos', filename);
    return res.sendFile(logoPath);
  }
}
