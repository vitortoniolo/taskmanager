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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('projects')
@UseGuards(JwtGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.projectsService.remove(id, req.user.id);
  }

  @Post(':projectId/users/:userId')
  @HttpCode(HttpStatus.OK)
  async addUserToProject(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.projectsService.addUserToProject(projectId, userId, req.user.id);
  }

  @Delete(':projectId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUserFromProject(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    await this.projectsService.removeUserFromProject(
      projectId,
      userId,
      req.user.id,
    );
  }
}
