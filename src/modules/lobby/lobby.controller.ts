import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../types';

@Controller('lobby')
@UseGuards(JwtAuthGuard)
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Post('join')
  join(@CurrentUser() user: JwtPayload, @Body('gymId') gymId: string) {
    return this.lobbyService.joinLobby(user.sub, gymId);
  }

  @Post('leave')
  leave(@CurrentUser() user: JwtPayload, @Body('gymId') gymId: string) {
    return this.lobbyService.leaveLobby(user.sub, gymId);
  }

  @Patch('workout-focus')
  setWorkoutFocus(
    @CurrentUser() user: JwtPayload,
    @Body('focus') focus: string,
  ) {
    return this.lobbyService.setWorkoutFocus(user.sub, focus);
  }

  @Get(':gymId/users')
  getActiveUsers(@Param('gymId') gymId: string) {
    return this.lobbyService.getActiveUsers(gymId);
  }

  @Get(':gymId/familiar-faces')
  getFamiliarFaces(@CurrentUser() user: JwtPayload, @Param('gymId') gymId: string) {
    return this.lobbyService.getFamiliarFaces(user.sub, gymId);
  }

  @Get(':gymId/insights')
  getInsights(@Param('gymId') gymId: string) {
    return this.lobbyService.getInsights(gymId);
  }
}
