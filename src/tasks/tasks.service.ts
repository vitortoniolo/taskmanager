import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // busca o projeto e garante que o usuário é membro dele
  private async getProjectAsMember(projectId: string, userId: string) {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['users'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.users.some((u) => u.id === userId)) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  // busca o responsável e garante que ele é membro do projeto
  private async getAssignee(project: Project, assigneeId: string) {
    const assignee = await this.usersRepository.findOne({
      where: { id: assigneeId },
    });

    if (!assignee) {
      throw new NotFoundException('Assignee not found');
    }
    if (!project.users.some((u) => u.id === assigneeId)) {
      throw new BadRequestException('Assignee must belong to the project');
    }

    return assignee;
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const project = await this.getProjectAsMember(
      createTaskDto.projectId,
      userId,
    );

    const assignee = createTaskDto.assigneeId
      ? await this.getAssignee(project, createTaskDto.assigneeId)
      : undefined;

    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      projectId: createTaskDto.projectId,
      project,
      assignee,
      assigneeId: assignee?.id,
    });

    return this.tasksRepository.save(task);
  }

  async findByProject(projectId: string, userId: string) {
    await this.getProjectAsMember(projectId, userId);

    return this.tasksRepository.find({
      where: { projectId },
      relations: ['project', 'assignee'],
    });
  }

  async findByUser(userId: string) {
    return this.tasksRepository.find({
      where: { assigneeId: userId },
      relations: ['project', 'assignee'],
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project', 'project.users', 'assignee'],
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    if (!task.project.users.some((u) => u.id === userId)) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.findOne(id, userId);

    // o novo responsável também precisa ser membro do projeto
    if (updateTaskDto.assigneeId) {
      await this.getAssignee(task.project, updateTaskDto.assigneeId);
    }

    Object.assign(task, updateTaskDto);

    // assigneeId null tira o responsável da tarefa
    if (updateTaskDto.assigneeId === null) {
      task.assignee = null;
    }

    return this.tasksRepository.save(task);
  }

  async remove(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    await this.tasksRepository.remove(task);
  }
}
