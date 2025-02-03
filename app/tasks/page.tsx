'use client';

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Modal from '@/components/Modal';
import CreateTaskForm from '@/components/CreateTaskForm';
import { supabase } from '@/utils/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  created_at: string;
  user_id: string;
}

export default function TasksPage() {
  const { user, isLoaded } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  async function fetchTasks() {
    try {
      setError(null);
      setIsLoading(true);

      console.log('Fetching tasks:', {
        userId: user?.id,
        isLoaded,
        hasUser: !!user
      });

      if (!user?.id) {
        throw new Error('No user ID available');
      }

      const { data, error, status } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Supabase response:', {
        status,
        hasData: !!data,
        error: error ? JSON.stringify(error, null, 2) : null
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch tasks');
      }

      setTasks(data || []);
    } catch (err: any) {
      console.error('Task fetch error:', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        fullError: JSON.stringify(err, null, 2)
      });
      setError(err?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateTask = async (taskData: { title: string; description: string; priority: string }) => {
    try {
      setError(null);
      setIsLoading(true);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const newTask = {
        ...taskData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to create task');
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      setTasks(prevTasks => [data, ...prevTasks]);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Task creation error:', {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        fullError: JSON.stringify(err, null, 2)
      });
      setError(err?.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isLoaded) return null;
  if (!user) redirect("/sign-in");

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md 
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-blue-500 disabled:opacity-50"
        >
          Create Task
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateTaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No tasks yet.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 border dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                <p className="mt-1 text-gray-600 dark:text-gray-300">{task.description}</p>
                <div className="mt-2 flex items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 