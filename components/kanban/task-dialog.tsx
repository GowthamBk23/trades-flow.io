'use client';

import { Dialog } from '@/components/ui/dialog';
import { Task, useTaskStore } from '@/lib/stores/task-store';
import { useState } from 'react';
import { format } from 'date-fns';

interface TaskDialogProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

export function TaskDialog({ task, open, onClose }: TaskDialogProps) {
  const { updateTask, addComment, addAttachment } = useTaskStore();
  const [comment, setComment] = useState('');

  const handleAddComment = () => {
    if (!comment.trim()) return;
    
    addComment(task.id, {
      id: crypto.randomUUID(),
      content: comment,
      userId: 'current-user', // Replace with actual user ID
      createdAt: new Date().toISOString(),
    });
    
    setComment('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Implement file upload to your storage solution
    // For now, we'll just simulate it
    addAttachment(task.id, {
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-600">{task.description}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500">Due Date</span>
                <p>{format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <span className="text-gray-500">Priority</span>
                <p className="capitalize">{task.priority}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Attachments</h3>
            <input
              type="file"
              onChange={handleFileUpload}
              className="mb-2"
            />
            <div className="space-y-2">
              {task.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center space-x-2"
                >
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {attachment.name}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Comments</h3>
            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                  <p>{comment.content}</p>
                  <span className="text-sm text-gray-500">
                    {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
              ))}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-md border-gray-300"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 