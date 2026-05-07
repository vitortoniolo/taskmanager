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
    console.log('Starting database seed...');

    try {
      // Clear existing data with try-catch for each
      try {
        await this.tasksRepository.query('DELETE FROM tasks');
      } catch (e) {
        // Table might not exist yet, that's ok
      }

      try {
        await this.projectsRepository.query('DELETE FROM projects');
      } catch (e) {
        // Table might not exist yet, that's ok
      }

      try {
        await this.usersRepository.query('DELETE FROM users');
      } catch (e) {
        // Table might not exist yet, that's ok
      }

      // Create users
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password123', 10);
    const hashedPassword3 = await bcrypt.hash('password123', 10);

    const user1 = this.usersRepository.create({
      name: 'João Silva',
      email: 'joao@example.com',
      password: hashedPassword1,
    });

    const user2 = this.usersRepository.create({
      name: 'Maria Santos',
      email: 'maria@example.com',
      password: hashedPassword2,
    });

    const user3 = this.usersRepository.create({
      name: 'Pedro Costa',
      email: 'pedro@example.com',
      password: hashedPassword3,
    });

    const savedUser1 = await this.usersRepository.save(user1);
    const savedUser2 = await this.usersRepository.save(user2);
    const savedUser3 = await this.usersRepository.save(user3);

    // Create projects
    const project1 = this.projectsRepository.create({
      name: 'E-Commerce Platform',
      description: 'Build a complete e-commerce solution',
      users: [savedUser1, savedUser2],
    });

    const project2 = this.projectsRepository.create({
      name: 'Mobile App',
      description: 'Develop iOS and Android apps',
      users: [savedUser2, savedUser3],
    });

    const project3 = this.projectsRepository.create({
      name: 'Internal Dashboard',
      description: 'Create analytics and reporting dashboard',
      users: [savedUser1, savedUser3],
    });

    const savedProject1 = await this.projectsRepository.save(project1);
    const savedProject2 = await this.projectsRepository.save(project2);
    const savedProject3 = await this.projectsRepository.save(project3);

    // Create tasks for Project 1
    const task1 = this.tasksRepository.create({
      title: 'Design database schema',
      description: 'Create ERD and database structure',
      status: TaskStatus.DONE,
      project: savedProject1,
      assignee: savedUser1,
    });

    const task2 = this.tasksRepository.create({
      title: 'Setup API authentication',
      description: 'Implement JWT authentication system',
      status: TaskStatus.DOING,
      project: savedProject1,
      assignee: savedUser2,
    });

    const task3 = this.tasksRepository.create({
      title: 'Build product catalog',
      description: 'Create product listing and details pages',
      status: TaskStatus.TODO,
      project: savedProject1,
      assignee: undefined,
    });

    // Create tasks for Project 2
    const task4 = this.tasksRepository.create({
      title: 'Setup React Native project',
      description: 'Initialize and configure React Native',
      status: TaskStatus.DOING,
      project: savedProject2,
      assignee: savedUser2,
    });

    const task5 = this.tasksRepository.create({
      title: 'Design UI components',
      description: 'Create reusable UI components',
      status: TaskStatus.TODO,
      project: savedProject2,
      assignee: savedUser3,
    });

    // Create tasks for Project 3
    const task6 = this.tasksRepository.create({
      title: 'Setup dashboard framework',
      description: 'Choose and setup dashboard framework',
      status: TaskStatus.TODO,
      project: savedProject3,
      assignee: savedUser1,
    });

    await this.tasksRepository.save([task1, task2, task3, task4, task5, task6]);

    console.log('Database seed completed successfully!');
    console.log(`Created 3 users, 3 projects, and 6 tasks`);
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}
