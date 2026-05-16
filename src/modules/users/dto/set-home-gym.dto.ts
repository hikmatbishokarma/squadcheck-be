import { IsMongoId } from 'class-validator';

export class SetHomeGymDto {
  @IsMongoId()
  gymId: string;
}
