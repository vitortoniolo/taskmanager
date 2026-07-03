import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Task, TaskStatus } from '../../tasks/entities/task.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async seed() {
    console.log('iniciando o seed do banco...');

    // limpa as tabelas (a ordem importa por causa das chaves estrangeiras)
    await this.tasksRepository.query('DELETE FROM tasks');
    await this.projectsRepository.query('DELETE FROM projects');
    await this.usersRepository.query('DELETE FROM users');

    // cria os usuários (todos com a senha "password123")
    const password = await bcrypt.hash('password123', 10);

    const [joao, maria, pedro] = await this.usersRepository.save(
      this.usersRepository.create([
        { name: 'João Silva', email: 'joao@example.com', password },
        { name: 'Maria Santos', email: 'maria@example.com', password },
        { name: 'Pedro Costa', email: 'pedro@example.com', password },
      ]),
    );

    // cria os projetos
    const [ecommerce, mobile, dashboard] = await this.projectsRepository.save(
      this.projectsRepository.create([
        {
          name: 'E-Commerce Platform',
          description: 'Build a complete e-commerce solution',
          users: [joao, maria],
        },
        {
          name: 'Mobile App',
          description: 'Develop iOS and Android apps',
          users: [maria, pedro],
        },
        {
          name: 'Internal Dashboard',
          description: 'Create analytics and reporting dashboard',
          users: [joao, pedro],
        },
      ]),
    );

    // cria as tarefas
    await this.tasksRepository.save(
      this.tasksRepository.create([
        {
          title: 'Design database schema',
          description: 'Create ERD and database structure',
          status: TaskStatus.DONE,
          project: ecommerce,
          assignee: joao,
        },
        {
          title: 'Setup API authentication',
          description: 'Implement JWT authentication system',
          status: TaskStatus.DOING,
          project: ecommerce,
          assignee: maria,
        },
        {
          title: 'Build product catalog',
          description: 'Create product listing and details pages',
          status: TaskStatus.TODO,
          project: ecommerce,
        },
        {
          title: 'Setup React Native project',
          description: 'Initialize and configure React Native',
          status: TaskStatus.DOING,
          project: mobile,
          assignee: maria,
        },
        {
          title: 'Design UI components',
          description: 'Create reusable UI components',
          status: TaskStatus.TODO,
          project: mobile,
          assignee: pedro,
        },
        {
          title: 'Setup dashboard framework',
          description: 'Choose and setup dashboard framework',
          status: TaskStatus.TODO,
          project: dashboard,
          assignee: joao,
        },
      ]),
    );

    console.log('seed concluído: 3 usuários, 3 projetos e 6 tarefas');
  }
}
