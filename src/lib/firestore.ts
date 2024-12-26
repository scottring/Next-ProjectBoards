import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { Project, Task } from '@/types';

// Projects
export const getProjects = async (userId: string) => {
  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
};

export const addProject = async (userId: string, project: Omit<Project, 'id'>) => {
  const projectsRef = collection(db, 'projects');
  const docRef = await addDoc(projectsRef, { ...project, userId });
  return { id: docRef.id, ...project };
};

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, updates);
};

export const deleteProject = async (projectId: string) => {
  const projectRef = doc(db, 'projects', projectId);
  await deleteDoc(projectRef);
};

// Tasks
export const getTasks = async (userId: string) => {
  const tasksRef = collection(db, 'tasks');
  const q = query(tasksRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const addTask = async (userId: string, task: Omit<Task, 'id'>) => {
  const tasksRef = collection(db, 'tasks');
  const docRef = await addDoc(tasksRef, { ...task, userId });
  return { id: docRef.id, ...task };
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, updates);
};

export const deleteTask = async (taskId: string) => {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
}; 