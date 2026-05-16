import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SquadsService } from './squads.service';
import { CreateSquadDto } from './dto/create-squad.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../types';

@Controller('squads')
@UseGuards(JwtAuthGuard)
export class SquadsController {
  constructor(private readonly squadsService: SquadsService) {}

  @Get(':gymId/suggested')
  getSuggested(@Param('gymId') gymId: string) {
    return this.squadsService.getSuggestedSquads(gymId);
  }

  @Get(':gymId/active')
  getActive(@Param('gymId') gymId: string) {
    return this.squadsService.getActiveSquads(gymId);
  }

  @Post()
  formSquad(@Body() dto: CreateSquadDto) {
    return this.squadsService.formSquad(dto);
  }

  @Post(':id/join')
  joinSquad(@Param('id') squadId: string, @CurrentUser() user: JwtPayload) {
    return this.squadsService.joinSquad(squadId, user.sub);
  }

  @Post(':id/leave')
  leaveSquad(@Param('id') squadId: string, @CurrentUser() user: JwtPayload) {
    return this.squadsService.leaveSquad(squadId, user.sub);
  }
}
