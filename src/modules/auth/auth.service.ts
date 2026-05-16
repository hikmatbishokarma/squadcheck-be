import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { LinkedinAuthDto } from './dto/linkedin-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async linkedinAuth(dto: LinkedinAuthDto): Promise<{ token: string; user: UserDocument }> {
    let user = await this.userModel.findOne({ email: dto.email });

    if (!user) {
      user = await this.userModel.create({
        name: dto.name,
        email: dto.email,
        avatar: dto.avatar,
      });
    } else if (!user.avatar && dto.avatar) {
      user.avatar = dto.avatar;
      await user.save();
    }

    const payload = { sub: (user as any)._id.toString(), email: user.email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwtSecret'),
      expiresIn: '30d',
    });

    return { token, user };
  }
}
