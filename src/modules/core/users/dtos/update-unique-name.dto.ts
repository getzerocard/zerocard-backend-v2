import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUniqueNameDto {
  @IsString()
  @IsNotEmpty()
  uniqueName: string;
}
