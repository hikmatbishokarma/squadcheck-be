import { ArrayMaxSize, ArrayMinSize, IsArray, IsMongoId } from 'class-validator';

export class CreateSquadDto {
  @IsMongoId()
  gymId: string;

  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(3)
  @ArrayMaxSize(5)
  memberIds: string[];
}
