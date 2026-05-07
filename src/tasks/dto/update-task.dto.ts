import { IsString, MinLength, MaxLength, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(0)
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}
