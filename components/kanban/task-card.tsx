import { Draggable } from '@hello-pangea/dnd';
import { Task } from '@/lib/stores/task-store';
import { format } from 'date-fns';
import { useState } from 'react';
import { TaskDialog } from './task-dialog';

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="bg-white p-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setIsOpen(true)}
          >
            <h3 className="font-medium mb-2">{task.title}</h3>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Due: {format(new Date(task.dueDate), 'MMM d')}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                task.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : task.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
            </div>
            {task.attachments.length > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                📎 {task.attachments.length} attachments
              </div>
            )}
          </div>
        )}
      </Draggable>

      <TaskDialog task={task} open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
} 