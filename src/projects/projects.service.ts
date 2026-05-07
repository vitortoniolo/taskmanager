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

    const project = this.projectsRepository.create({
      ...createProjectDto,
      users: [user],
    });

    return this.projectsRepository.save(project);
  }

  async findAll(userId: string) {
    return this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.users', 'user')
      .leftJoinAndSelect('project.tasks', 'task')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async findOne(id: string, userId: string) {
    const project = await this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.users', 'user')
      .leftJoinAndSelect('project.tasks', 'task')
      .where('project.id = :id', { id })
      .getOne();

    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    const userBelongsToProject = project.users.some((u) => u.id === userId);
    if (!userBelongsToProject) {
      throw new ForbiddenException(
        'You do not have access to this project',
      );
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

  async addUserToProject(projectId: string, userId: string, currentUserId: string) {
    const project = await this.findOne(projectId, currentUserId);
    const userToAdd = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    const userAlreadyInProject = project.users.some((u) => u.id === userId);
    if (userAlreadyInProject) {
      throw new BadRequestException('User already belongs to this project');
    }

    project.users.push(userToAdd);
    return this.projectsRepository.save(project);
  }

  async removeUserFromProject(projectId: string, userId: string, currentUserId: string) {
    const project = await this.findOne(projectId, currentUserId);

    const userIndex = project.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new NotFoundException('User not found in this project');
    }

    project.users.splice(userIndex, 1);
    return this.projectsRepository.save(project);
  }
}
