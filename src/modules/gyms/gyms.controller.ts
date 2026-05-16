import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('gyms')
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  @Get()
  findAll() {
    return this.gymsService.findAll();
  }

  // Must be declared before :id to avoid route shadowing
  @Get('branch/:branchId')
  findByBranch(@Param('branchId') branchId: string) {
    return this.gymsService.findByBranchId(branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gymsService.findById(id);
  }

  @Get(':id/active-users')
  @UseGuards(JwtAuthGuard)
  getActiveUsers(@Param('id') id: string) {
    return this.gymsService.getActiveUsers(id);
  }

  @Post()
  create(@Body() dto: CreateGymDto) {
    return this.gymsService.create(dto);
  }
}
