import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../types';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetHomeGymDto } from './dto/set-home-gym.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Patch('me/onboarding')
  completeOnboarding(@CurrentUser() user: JwtPayload, @Body() dto: CompleteOnboardingDto) {
    return this.usersService.completeOnboarding(user.sub, dto);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Patch('me/home-gym')
  setHomeGym(@CurrentUser() user: JwtPayload, @Body() dto: SetHomeGymDto) {
    return this.usersService.setHomeGym(user.sub, dto.gymId);
  }
}
