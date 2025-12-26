export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Content {
  _id: string;
  title: string;
  content: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  tone: string;
  language: string;
  created_by: string;
  created_at: Date;
  tags: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
