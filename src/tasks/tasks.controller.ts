import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import type { AuthRequest } from '../auth/auth-request';

@Controller('tasks')
@UseGuards(JwtGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: AuthRequest,
  ) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  async findAll(
    @Request() req: AuthRequest,
    @Query('projectId') projectId?: string,
  ) {
    if (projectId) {
      return this.tasksService.findByProject(projectId, req.user.id);
    }
    return this.tasksService.findByUser(req.user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthRequest,
  ) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: AuthRequest,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthRequest,
  ) {
    await this.tasksService.remove(id, req.user.id);
  }
}
