import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(0)
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @IsUUID()
  projectId: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}
