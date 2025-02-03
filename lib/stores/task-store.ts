import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
  comments: Comment[];
  attachments: Attachment[];
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface Attachment {
  id: string;
  url: string;
  name: string;
  type: string;
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addComment: (taskId: string, comment: Comment) => void;
  addAttachment: (taskId: string, attachment: Attachment) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        })),
      moveTask: (taskId, newStatus) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          ),
        })),
      addComment: (taskId, comment) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, comments: [...task.comments, comment] }
              : task
          ),
        })),
      addAttachment: (taskId, attachment) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, attachments: [...task.attachments, attachment] }
              : task
          ),
        })),
    }),
    {
      name: 'task-store',
    }
  )
); 