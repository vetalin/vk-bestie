export type VKUser = UserInfo;

export interface UserInfo {
  id: number;
  first_name: string;
  last_name: string;
  photo_200?: string;
  sex?: number;
}

export interface Friend {
  id: number;
  name: string;
  avatar?: string;
  score?: number;
  answers?: Record<number, number>;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  category: 'food' | 'habits' | 'stories' | 'fun';
}
