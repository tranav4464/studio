
import type { BlogPost, BlogTone, BlogStyle, BlogLength } from '@/types';
import { formatISO } from 'date-fns';

let posts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of AI in Content Creation',
    topic: 'AI in Content Creation',
    tone: 'informative',
    style: 'journalistic',
    length: 'medium',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n## Subheading 1\n\nMore details here.\n\n## Subheading 2\n\nEven more details.',
    outline: ['Introduction to AI in Content', 'Current State of AI Tools', 'Future Trends', 'Ethical Considerations', 'Conclusion'],
    createdAt: formatISO(new Date(2023, 10, 15)),
    updatedAt: formatISO(new Date(2023, 10, 16)),
    status: 'published',
    heroImageUrl: 'https://placehold.co/800x400.png',
    heroImagePrompt: 'Futuristic AI helping write content',
    heroImageCaption: 'AI assisting a writer',
    heroImageAltText: 'Abstract image of AI and writing tools',
    seoScore: { readability: 75, keywordDensity: 60, quality: 80 },
  },
  {
    id: '2',
    title: 'Mastering Tailwind CSS for Beginners',
    topic: 'Tailwind CSS',
    tone: 'casual',
    style: 'technical',
    length: 'long',
    content: 'Tailwind CSS is a utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup. This guide will walk you through the basics and help you get started quickly.',
    outline: ['What is Tailwind CSS?', 'Setting up your project', 'Core Concepts', 'Responsive Design', 'Customization', 'Advanced Techniques'],
    createdAt: formatISO(new Date(2023, 11, 1)),
    updatedAt: formatISO(new Date(2023, 11, 5)),
    status: 'draft',
    seoScore: { readability: 80, keywordDensity: 70, quality: 75 },
  },
];

let listeners: Array<() => void> = [];

export const blogStore = {
  addPost: (postData: { title: string; topic: string; tone: BlogTone; style: BlogStyle; length: BlogLength }): BlogPost => {
    const newId = String(Date.now());
    const now = formatISO(new Date());
    const newPost: BlogPost = {
      ...postData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      content: `This is the initial draft for "${postData.title}". Start writing here! Explore ideas related to ${postData.topic} using a ${postData.tone} and ${postData.style} approach. Aim for a ${postData.length} piece.`,
      outline: [`Introduction to ${postData.topic}`, 'Key Point 1', 'Key Point 2', 'Conclusion'],
      seoScore: { readability: 0, keywordDensity: 0, quality: 0 }
    };
    posts = [...posts, newPost];
    emitChange();
    return newPost;
  },
  getPosts: (): BlogPost[] => {
    return posts;
  },
  getPostById: (id: string): BlogPost | undefined => {
    return posts.find(post => post.id === id);
  },
  updatePost: (id: string, updatedFields: Partial<BlogPost>): BlogPost | undefined => {
    let updatedPost: BlogPost | undefined;
    posts = posts.map(post => {
      if (post.id === id) {
        updatedPost = { ...post, ...updatedFields, updatedAt: formatISO(new Date()) };
        return updatedPost;
      }
      return post;
    });
    if (updatedPost) emitChange();
    return updatedPost;
  },
  deletePost: (id: string): void => {
    posts = posts.filter(post => post.id !== id);
    emitChange();
  },
  subscribe: (listener: () => void): (() => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};

const emitChange = () => {
  for (let listener of listeners) {
    listener();
  }
};
