import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../types';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('subscribe')
  subscribe(@CurrentUser() user: JwtPayload, @Body() dto: SubscribeDto) {
    return this.notificationsService.subscribe(user.sub, dto);
  }

  @Delete('unsubscribe')
  unsubscribe(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.unsubscribe(user.sub);
  }

  @Get('subscription')
  getSubscription(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getSubscription(user.sub);
  }
}
