import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderTaskService } from './work-order-task.service';
import { WorkOrderTask, TaskStatus } from '../entities/work-order-task.entity';
import { WorkOrder, WorkOrderStatus } from '../entities/work-order.entity';
import { User } from '../../../entities/user.entity';
import { CreateWorkOrderTaskDto } from '../dto/create-work-order-task.dto';
import { UpdateWorkOrderTaskDto } from '../dto/update-work-order-task.dto';
import { WorkOrderTaskQueryDto } from '../dto/work-order-task-query.dto';
import { createMockRepository, TestDataFactory } from '../../../test-utils/test-utils';

describe('WorkOrderTaskService', () => {
  let service: WorkOrderTaskService;
  let workOrderTaskRepository: jest.Mocked<Repository<WorkOrderTask>>;
  let workOrderRepository: jest.Mocked<Repository<WorkOrder>>;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderTaskService,
        {
          provide: getRepositoryToken(WorkOrderTask),
          useValue: createMockRepository<WorkOrderTask>(),
        },
        {
          provide: getRepositoryToken(WorkOrder),
          useValue: createMockRepository<WorkOrder>(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
      ],
    }).compile();

    service = module.get<WorkOrderTaskService>(WorkOrderTaskService);
    workOrderTaskRepository = module.get(getRepositoryToken(WorkOrderTask));
    workOrderRepository = module.get(getRepositoryToken(WorkOrder));
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const createDto: CreateWorkOrderTaskDto = {
      work_order_id: 'work-order-id',
      task_name: 'Assembly Task',
      description: 'Assemble components',
      operation: 'Assembly',
      workstation: 'WS001',
      planned_start_time: new Date('2024-01-01T08:00:00Z'),
      planned_end_time: new Date('2024-01-01T16:00:00Z'),
      estimated_time_hours: 8,
      assigned_user_id: 'user-id',
    };

    it('should create a work order task successfully', async () => {
      const user = TestDataFactory.createUser();
      const workOrder = TestDataFactory.createWorkOrder({
        status: WorkOrderStatus.DRAFT,
      });
      const expectedTask = TestDataFactory.createWorkOrderTask({
        task_name: createDto.task_name,
        description: createDto.description,
        operation: createDto.operation,
        workstation: createDto.workstation,
        planned_start_time: createDto.planned_start_time,
        planned_end_time: createDto.planned_end_time,
        estimated_time_hours: createDto.estimated_time_hours,
        work_order: workOrder,
        assigned_user: user,
      });

      userRepository.findOne.mockResolvedValue(user as User);
      workOrderRepository.findOne.mockResolvedValue(workOrder as WorkOrder);
      workOrderTaskRepository.create.mockReturnValue(expectedTask as WorkOrderTask);
      workOrderTaskRepository.save.mockResolvedValue(expectedTask as WorkOrderTask);

      const result = await service.createTask('tenant-id', createDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.assigned_user_id },
      });
      expect(workOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.work_order_id, tenant_id: 'tenant-id' },
      });
      expect(workOrderTaskRepository.create).toHaveBeenCalledWith({
        ...createDto,
        status: TaskStatus.PENDING,
        work_order: workOrder,
        assigned_user: user,
      });
      expect(workOrderTaskRepository.save).toHaveBeenCalledWith(expectedTask);
      expect(result).toEqual(expectedTask);
    });

    it('should throw NotFoundException if assigned user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createTask('tenant-id', createDto)
      ).rejects.toThrow(new NotFoundException('Assigned user not found'));

      expect(workOrderRepository.findOne).not.toHaveBeenCalled();
      expect(workOrderTaskRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if work order not found', async () => {
      const user = TestDataFactory.createUser();
      userRepository.findOne.mockResolvedValue(user as User);
      workOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createTask('tenant-id', createDto)
      ).rejects.toThrow(new NotFoundException('Work order not found'));

      expect(workOrderTaskRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if work order is completed', async () => {
      const user = TestDataFactory.createUser();
      const completedWorkOrder = TestDataFactory.createWorkOrder({
        status: WorkOrderStatus.COMPLETED,
      });
      userRepository.findOne.mockResolvedValue(user as User);
      workOrderRepository.findOne.mockResolvedValue(completedWorkOrder as WorkOrder);

      await expect(
        service.createTask('tenant-id', createDto)
      ).rejects.toThrow(
        new BadRequestException('Cannot add tasks to completed work order')
      );
    });

    it('should throw BadRequestException if planned end time is before start time', async () => {
      const invalidDto = {
        ...createDto,
        planned_start_time: new Date('2024-01-01T16:00:00Z'),
        planned_end_time: new Date('2024-01-01T08:00:00Z'),
      };

      const user = TestDataFactory.createUser();
      const workOrder = TestDataFactory.createWorkOrder();
      userRepository.findOne.mockResolvedValue(user as User);
      workOrderRepository.findOne.mockResolvedValue(workOrder as WorkOrder);

      await expect(
        service.createTask('tenant-id', invalidDto)
      ).rejects.toThrow(
        new BadRequestException('Planned end time must be after start time')
      );
    });
  });

  describe('findAllTasks', () => {
    const queryDto: WorkOrderTaskQueryDto = {
      page: 1,
      limit: 10,
      search: 'assembly',
      status: TaskStatus.PENDING,
      work_order_id: 'work-order-id',
      assigned_user_id: 'user-id',
      operation: 'Assembly',
      workstation: 'WS001',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };

    it('should return paginated work order tasks', async () => {
      const tasks = [
        TestDataFactory.createWorkOrderTask({ task_name: 'Task 1' }),
        TestDataFactory.createWorkOrderTask({ task_name: 'Task 2' }),
      ];
      const total = 2;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([tasks, total]),
      };

      workOrderTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAllTasks('tenant-id', queryDto);

      expect(workOrderTaskRepository.createQueryBuilder).toHaveBeenCalledWith('task');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('task.work_order', 'work_order');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('task.assigned_user', 'assigned_user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('work_order.tenant_id = :tenant_id', {
        tenant_id: 'tenant-id',
      });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('task.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        tasks,
        total,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should handle empty results', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      workOrderTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAllTasks('tenant-id', { page: 1, limit: 10 });

      expect(result).toEqual({
        tasks: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('findOneTask', () => {
    it('should return a work order task by id', async () => {
      const task = TestDataFactory.createWorkOrderTask();
      workOrderTaskRepository.findOne.mockResolvedValue(task as WorkOrderTask);

      const result = await service.findOneTask('task-id', 'tenant-id');

      expect(workOrderTaskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'task-id',
          work_order: { tenant_id: 'tenant-id' },
        },
        relations: ['work_order', 'assigned_user'],
      });
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException if task not found', async () => {
      workOrderTaskRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneTask('non-existent-id', 'tenant-id')
      ).rejects.toThrow(new NotFoundException('Work order task not found'));
    });
  });

  describe('updateTask', () => {
    const updateDto: UpdateWorkOrderTaskDto = {
      task_name: 'Updated Task',
      description: 'Updated description',
      estimated_time_hours: 10,
      workstation: 'WS002',
      assigned_user_id: 'new-user-id',
    };

    it('should update a work order task successfully', async () => {
      const existingTask = TestDataFactory.createWorkOrderTask({
        status: TaskStatus.PENDING,
      });
      const newUser = TestDataFactory.createUser({ id: 'new-user-id' });
      const updatedTask = {
        ...existingTask,
        ...updateDto,
        assigned_user: newUser,
      };

      workOrderTaskRepository.findOne.mockResolvedValue(existingTask as WorkOrderTask);
      userRepository.findOne.mockResolvedValue(newUser as User);
      workOrderTaskRepository.save.mockResolvedValue(updatedTask as WorkOrderTask);

      const result = await service.updateTask('task-id', 'tenant-id', updateDto);

      expect(workOrderTaskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'task-id',
          work_order: { tenant_id: 'tenant-id' },
        },
        relations: ['work_order'],
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.assigned_user_id },
      });
      expect(workOrderTaskRepository.save).toHaveBeenCalledWith({
        ...existingTask,
        task_name: updateDto.task_name,
        description: updateDto.description,
        estimated_time_hours: updateDto.estimated_time_hours,
        workstation: updateDto.workstation,
        assigned_user: newUser,
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      workOrderTaskRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTask('non-existent-id', 'tenant-id', updateDto)
      ).rejects.toThrow(new NotFoundException('Work order task not found'));
    });

    it('should throw BadRequestException if task is completed', async () => {
      const completedTask = TestDataFactory.createWorkOrderTask({
        status: TaskStatus.COMPLETED,
      });
      workOrderTaskRepository.findOne.mockResolvedValue(completedTask as WorkOrderTask);

      await expect(
        service.updateTask('task-id', 'tenant-id', updateDto)
      ).rejects.toThrow(
        new BadRequestException('Cannot update completed task')
      );
    });

    it('should throw NotFoundException if new assigned user not found', async () => {
      const existingTask = TestDataFactory.createWorkOrderTask();
      workOrderTaskRepository.findOne.mockResolvedValue(existingTask as WorkOrderTask);
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTask('task-id', 'tenant-id', updateDto)
      ).rejects.toThrow(new NotFoundException('Assigned user not found'));
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status to IN_PROGRESS successfully', async () => {
      const task = TestDataFactory.createWorkOrderTask({
        status: TaskStatus.PENDING,
      });
      const updatedTask = {
        ...task,
        status: TaskStatus.IN_PROGRESS,
        actual_start_time: expect.any(Date),
      };

      workOrderTaskRepository.findOne.mockResolvedValue(task as WorkOrderTask);
      workOrderTaskRepository.save.mockResolvedValue(updatedTask as WorkOrderTask);

      const result = await service.updateTaskStatus(
        'task-id',
        'tenant-id',
        TaskStatus.IN_PROGRESS
      );

      expect(workOrderTaskRepository.save).toHaveBeenCalledWith({
        ...task,
        status: TaskStatus.IN_PROGRESS,
        actual_start_time: expect.any(Date),
      });
      expect(result).toEqual(updatedTask);
    });

    it('should update task status to COMPLETED successfully', async () => {
      const task = TestDataFactory.createWorkOrderTask({
        status: TaskStatus.IN_PROGRESS,
        actual_start_time: new Date('2024-01-01T08:00:00Z'),
      });
      const updatedTask = {
        ...task,
        status: TaskStatus.COMPLETED,
        actual_end_time: expect.any(Date),
        actual_time_hours: expect.any(Number),
      };

      workOrderTaskRepository.findOne.mockResolvedValue(task as WorkOrderTask);
      workOrderTaskRepository.save.mockResolvedValue(updatedTask as WorkOrderTask);

      const result = await service.updateTaskStatus(
        'task-id',
        'tenant-id',
        TaskStatus.COMPLETED
      );

      expect(workOrderTaskRepository.save).toHaveBeenCalledWith({
        ...task,
        status: TaskStatus.COMPLETED,
        actual_end_time: expect.any(Date),
        actual_time_hours: expect.any(Number),
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      workOrderTaskRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTaskStatus('non-existent-id', 'tenant-id', TaskStatus.IN_PROGRESS)
      ).rejects.toThrow(new NotFoundException('Work order task not found'));
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const completedTask = TestDataFactory.createWorkOrderTask({
        status: TaskStatus.COMPLETED,
      });
      workOrderTaskRepository.findOne.mockResolvedValue(completedTask as WorkOrderTask);

      await expect(
        service.updateTaskStatus('task-id', 'tenant-id', TaskStatus.PENDING)
      ).rejects.toThrow(
        new BadRequestException('Invalid status transition from COMPLETED to PENDING')
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete a work order task successfully', async () => {
      const task = TestDataFactory.createWorkOrderTask({
        status: TaskStatus.PENDING,
      });
      workOrderTaskRepository.findOne.mockResolvedValue(task as WorkOrderTask);
      workOrderTaskRepository.remove.mockResolvedValue(task as WorkOrderTask);

      await service.deleteTask('task-id', 'tenant-id');

      expect(workOrderTaskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'task-id',
          work_order: { tenant_id: 'tenant-id' },
        },
        relations: ['work_order'],
      });
      expect(workOrderTaskRepository.remove).toHaveBeenCalledWith(task);
    });

    it('should throw NotFoundException if task not found', async () => {
      workOrderTaskRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteTask('non-existent-id', 'tenant-id')
      ).rejects.toThrow(new NotFoundException('Work order task not found'));
    });

    it('should throw BadRequestException if task is in progress', async () => {
      const inProgressTask = TestDataFactory.createWorkOrderTask({
        status: TaskStatus.IN_PROGRESS,
      });
      workOrderTaskRepository.findOne.mockResolvedValue(inProgressTask as WorkOrderTask);

      await expect(
        service.deleteTask('task-id', 'tenant-id')
      ).rejects.toThrow(
        new BadRequestException('Cannot delete task that is in progress or completed')
      );
    });

    it('should throw BadRequestException if task is completed', async () => {
      const completedTask = TestDataFactory.createWorkOrderTask({
        status: TaskStatus.COMPLETED,
      });
      workOrderTaskRepository.findOne.mockResolvedValue(completedTask as WorkOrderTask);

      await expect(
        service.deleteTask('task-id', 'tenant-id')
      ).rejects.toThrow(
        new BadRequestException('Cannot delete task that is in progress or completed')
      );
    });
  });

  describe('getTasksByWorkOrder', () => {
    it('should return tasks for a specific work order', async () => {
      const tasks = [
        TestDataFactory.createWorkOrderTask({ task_name: 'Task 1' }),
        TestDataFactory.createWorkOrderTask({ task_name: 'Task 2' }),
      ];

      workOrderTaskRepository.find.mockResolvedValue(tasks as WorkOrderTask[]);

      const result = await service.getTasksByWorkOrder('work-order-id', 'tenant-id');

      expect(workOrderTaskRepository.find).toHaveBeenCalledWith({
        where: {
          work_order: {
            id: 'work-order-id',
            tenant_id: 'tenant-id',
          },
        },
        relations: ['assigned_user'],
        order: { sequence: 'ASC' },
      });
      expect(result).toEqual(tasks);
    });

    it('should return empty array if no tasks found', async () => {
      workOrderTaskRepository.find.mockResolvedValue([]);

      const result = await service.getTasksByWorkOrder('work-order-id', 'tenant-id');

      expect(result).toEqual([]);
    });
  });

  describe('getTasksByUser', () => {
    it('should return tasks assigned to a specific user', async () => {
      const tasks = [
        TestDataFactory.createWorkOrderTask({ task_name: 'User Task 1' }),
        TestDataFactory.createWorkOrderTask({ task_name: 'User Task 2' }),
      ];

      workOrderTaskRepository.find.mockResolvedValue(tasks as WorkOrderTask[]);

      const result = await service.getTasksByUser('user-id', 'tenant-id');

      expect(workOrderTaskRepository.find).toHaveBeenCalledWith({
        where: {
          assigned_user: { id: 'user-id' },
          work_order: { tenant_id: 'tenant-id' },
        },
        relations: ['work_order', 'work_order.production_plan'],
        order: { planned_start_time: 'ASC' },
      });
      expect(result).toEqual(tasks);
    });
  });
});