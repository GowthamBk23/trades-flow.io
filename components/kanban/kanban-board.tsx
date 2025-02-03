'use client';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTaskStore, TaskStatus, Task } from '@/lib/stores/task-store';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';
import { AddTaskDialog } from './add-task-dialog';
import { useState } from 'react';

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'pending', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Done' },
];

export function KanbanBoard() {
  const { tasks, moveTask } = useTaskStore();
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    moveTask(draggableId, destination.droppableId as TaskStatus);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <button
          onClick={() => setIsAddingTask(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={tasks.filter((task) => task.status === column.id)}
            />
          ))}
        </div>
      </DragDropContext>

      <AddTaskDialog open={isAddingTask} onClose={() => setIsAddingTask(false)} />
    </div>
  );
} 