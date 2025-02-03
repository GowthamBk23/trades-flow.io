import { Droppable } from '@hello-pangea/dnd';
import { Task } from '@/lib/stores/task-store';
import { TaskCard } from './task-card';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="font-semibold mb-4">{title}</h2>
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-4"
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
} 