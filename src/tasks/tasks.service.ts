import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
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

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const project = await this.projectsRepository.findOne({
      where: { id: createTaskDto.projectId },
      relations: ['users'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const userBelongsToProject = project.users.some((u) => u.id === userId);
    if (!userBelongsToProject) {
      throw new ForbiddenException(
        'You do not have access to this project',
      );
    }

    let assignee: User | null = null;
    if (createTaskDto.assigneeId) {
      assignee = await this.usersRepository.findOne({
        where: { id: createTaskDto.assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }

      const assigneeBelongsToProject = project.users.some(
        (u) => u.id === createTaskDto.assigneeId,
      );
      if (!assigneeBelongsToProject) {
        throw new BadRequestException(
          'Assignee must belong to the project',
        );
      }
    }

    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      projectId: createTaskDto.projectId,
      project,
      assignee: assignee || undefined,
      assigneeId: assignee?.id,
    });

    return this.tasksRepository.save(task);
  }

  async findByProject(projectId: string, userId: string) {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['users'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const userBelongsToProject = project.users.some((u) => u.id === userId);
    if (!userBelongsToProject) {
      throw new ForbiddenException(
        'You do not have access to this project',
      );
    }

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

    const userBelongsToProject = task.project.users.some(
      (u) => u.id === userId,
    );
    if (!userBelongsToProject) {
      throw new ForbiddenException(
        'You do not have access to this task',
      );
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.findOne(id, userId);

    if (updateTaskDto.status) {
      this.validateTaskStatusTransition(task.status, updateTaskDto.status);
    }

    if (updateTaskDto.assigneeId) {
      const project = await this.projectsRepository.findOne({
        where: { id: task.projectId },
        relations: ['users'],
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const assigneeBelongsToProject = project.users.some(
        (u) => u.id === updateTaskDto.assigneeId,
      );
      if (!assigneeBelongsToProject) {
        throw new BadRequestException(
          'Assignee must belong to the project',
        );
      }
    }

    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    await this.tasksRepository.remove(task);
  }

  private validateTaskStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ) {
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.TODO]: [TaskStatus.TODO, TaskStatus.DOING],
      [TaskStatus.DOING]: [TaskStatus.DOING, TaskStatus.DONE],
      [TaskStatus.DONE]: [TaskStatus.DONE],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
