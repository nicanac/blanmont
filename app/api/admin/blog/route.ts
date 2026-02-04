import { NextRequest, NextResponse } from 'next/server';
import { createBlogPost } from '@/app/lib/firebase/blog';
import { BlogPost } from '@/app/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const postData: Omit<BlogPost, 'id'> = {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage || '/images/blog-placeholder.jpg',
      author: data.author,
      authorAvatar: data.authorAvatar || '/images/default-avatar.png',
      publishedAt: new Date().toISOString(),
      category: data.category,
      isPublished: data.isPublished ?? true,
    };

    const postId = await createBlogPost(postData);
    return NextResponse.json({ success: true, id: postId });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
