import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { WorkOrderTask, TaskStatus } from '../../../entities/work-order-task.entity';

@Injectable()
export class WorkOrderTaskService {
  constructor(
    @InjectRepository(WorkOrderTask)
    private readonly taskRepository: Repository<WorkOrderTask>,
  ) {}

  async findByWorkOrder(workOrderId: string, tenant_id: string): Promise<WorkOrderTask[]> {
    return await this.taskRepository.find({
      where: { 
        workOrder: { id: workOrderId },
        tenant: { id: tenant_id }
      },
      relations: ['workOrder', 'createdBy', 'assignedTo'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string, tenant_id: string): Promise<WorkOrderTask> {
    const task = await this.taskRepository.findOne({
      where: { id, tenant: { id: tenant_id } },
      relations: ['workOrder', 'createdBy', 'assignedTo'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async updateStatus(id: string, status: TaskStatus, tenant_id: string): Promise<WorkOrderTask> {
    const task = await this.findOne(id, tenant_id);
    task.status = status;
    
    if (status === TaskStatus.COMPLETED) {
      task.actualEndTime = new Date();
    } else if (status === TaskStatus.IN_PROGRESS && !task.actualStartTime) {
      task.actualStartTime = new Date();
    }
    
    return await this.taskRepository.save(task);
  }

  async updateProgress(id: string, progressPercentage: number, tenant_id: string): Promise<WorkOrderTask> {
    const task = await this.findOne(id, tenant_id);
    task.progressPercentage = progressPercentage;
    
    // Auto-update status based on progress
    if (progressPercentage === 100 && task.status !== TaskStatus.COMPLETED) {
      task.status = TaskStatus.COMPLETED;
      task.actualEndTime = new Date();
    } else if (progressPercentage > 0 && task.status === TaskStatus.PENDING) {
      task.status = TaskStatus.IN_PROGRESS;
      task.actualStartTime = new Date();
    }
    
    return await this.taskRepository.save(task);
  }

  async addNotes(id: string, notes: string, tenant_id: string): Promise<WorkOrderTask> {
    const task = await this.findOne(id, tenant_id);
    task.notes = notes;
    return await this.taskRepository.save(task);
  }

  async addCompletionNotes(id: string, completionNotes: string, tenant_id: string): Promise<WorkOrderTask> {
    const task = await this.findOne(id, tenant_id);
    task.completionNotes = completionNotes;
    return await this.taskRepository.save(task);
  }

  async getTaskStatistics(workOrderId?: string, tenant_id?: string): Promise<{
    total: number;
    byStatus: Record<TaskStatus, number>;
    averageCompletionTime: number;
  }> {
    const where: any = { tenant: { id: tenant_id } };
    if (workOrderId) {
      where.workOrder = { id: workOrderId };
    }

    const total = await this.taskRepository.count({ where });

    const byStatus: Record<TaskStatus, number> = {} as any;
    for (const status of Object.values(TaskStatus)) {
      byStatus[status as TaskStatus] = await this.taskRepository.count({
        where: { ...where, status },
      });
    }

    // Calculate average completion time for completed tasks
    const completedTasks = await this.taskRepository.find({
      where: { ...where, status: TaskStatus.COMPLETED },
      select: ['actualStartTime', 'actualEndTime'],
    });

    let averageCompletionTime = 0;
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        if (task.actualStartTime && task.actualEndTime) {
          return sum + (task.actualEndTime.getTime() - task.actualStartTime.getTime());
        }
        return sum;
      }, 0);
      averageCompletionTime = totalTime / completedTasks.length / (1000 * 60 * 60); // Convert to hours
    }

    return { total, byStatus, averageCompletionTime };
  }

  private isValidStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.PENDING]: [
        TaskStatus.IN_PROGRESS,
        TaskStatus.ON_HOLD,
        TaskStatus.CANCELLED,
      ],
      [TaskStatus.IN_PROGRESS]: [
        TaskStatus.COMPLETED,
        TaskStatus.ON_HOLD,
        TaskStatus.CANCELLED,
        TaskStatus.FAILED,
      ],
      [TaskStatus.ON_HOLD]: [
        TaskStatus.IN_PROGRESS,
        TaskStatus.CANCELLED,
      ],
      [TaskStatus.COMPLETED]: [],
      [TaskStatus.CANCELLED]: [],
      [TaskStatus.FAILED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}