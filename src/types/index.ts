// Blog types
export interface Blog {
  _id?: string;
  title: string;
  content: string;
  summary?: string;
  image?: string;
  author?: string;
  status?: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

// Blog state types
export interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
}
