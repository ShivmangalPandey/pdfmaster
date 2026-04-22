export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface AdminUser {
  id: string;
  username: string;
}
