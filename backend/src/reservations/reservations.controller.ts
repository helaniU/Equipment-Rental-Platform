import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../database/entities/role.entity';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

@ApiTags('Reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @Roles(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({ summary: 'Create a new equipment reservation' })
  create(@Request() req: any, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(req.user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user reservations (or all for Admin/Staff/Warehouse)' })
  findAll(@Request() req: any) {
    return this.reservationsService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation details by ID' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.reservationsService.findOne(id, req.user);
  }

  @Patch(':id/status')
  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.WAREHOUSE_OPERATOR)
  @ApiOperation({ summary: 'Update reservation status (Admin/Staff/Warehouse)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReservationStatusDto) {
    return this.reservationsService.updateStatus(id, dto);
  }

  @Put(':id/cancel')
  @Roles(RoleType.CUSTOMER, RoleType.ADMIN, RoleType.STAFF)
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.reservationsService.cancel(id, req.user);
  }
}