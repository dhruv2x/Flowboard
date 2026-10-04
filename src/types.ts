export type Role = 'admin' | 'member';
export type Tone = 'clay' | 'moss' | 'slate';

export interface User {
  id: string;
  name: string;
  role: Role;
  tone: Tone;
}

export type ContainerType = 'workspace' | 'space' | 'folder' | 'list';
export type Visibility = 'public' | 'private';

export interface Container {
  id: string;
  name: string;
  type: ContainerType;
  parentId: string | null;
  position: number;
  visibility: Visibility;
  archivedAt: string | null;
}

export type StatusCategory = 'todo' | 'in_progress' | 'done';
export type StatusColor = 'stone' | 'amber' | 'sky' | 'green';

export interface Status {
  id: string;
  listId: string;
  name: string;
  category: StatusCategory;
  color: StatusColor;
  position: number;
}

export type Priority = 'urgent' | 'high' | 'normal' | 'low' | 'none';

export interface Task {
  id: string;
  number: number;
  title: string;
  description: string;
  statusId: string;
  priority: Priority;
  assigneeIds: string[];
  dueDate: string | null;
  position: number;
  primaryListId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grant {
  id: string;
  resourceId: string;
  userId: string;
  mode: 'allow' | 'deny';
}

export const CHILD_TYPE: Record<ContainerType, ContainerType | null> = {
  workspace: 'space',
  space: 'folder',
  folder: 'list',
  list: null,
};
