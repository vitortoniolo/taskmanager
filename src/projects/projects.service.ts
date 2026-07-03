import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // quem cria o projeto já entra como membro
    const project = this.projectsRepository.create({
      ...createProjectDto,
      users: [user],
    });

    return this.projectsRepository.save(project);
  }

  // lista só os projetos em que o usuário é membro
  async findAll(userId: string) {
    return this.projectsRepository.find({
      where: { users: { id: userId } },
      relations: ['users', 'tasks'],
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['users', 'tasks'],
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    if (!project.users.some((u) => u.id === userId)) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.findOne(id, userId);

    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id, userId);
    await this.projectsRepository.remove(project);
  }

  async addUserToProject(
    projectId: string,
    userId: string,
    currentUserId: string,
  ) {
    const project = await this.findOne(projectId, currentUserId);

    const userToAdd = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }
    if (project.users.some((u) => u.id === userId)) {
      throw new BadRequestException('User already belongs to this project');
    }

    project.users.push(userToAdd);
    return this.projectsRepository.save(project);
  }

  async removeUserFromProject(
    projectId: string,
    userId: string,
    currentUserId: string,
  ) {
    const project = await this.findOne(projectId, currentUserId);

    if (!project.users.some((u) => u.id === userId)) {
      throw new NotFoundException('User not found in this project');
    }

    project.users = project.users.filter((u) => u.id !== userId);
    return this.projectsRepository.save(project);
  }
}
