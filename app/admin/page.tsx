import React from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { getBlogPosts } from '../lib/firebase/blog';
import { getMembers } from '../lib/firebase/members';
import { getCalendarEvents } from '../lib/firebase/calendar';

export const dynamic = 'force-dynamic';

/**
 * Formats a date string to a readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Admin Dashboard - Main page with quick stats and recent items
 */
export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  // Fetch data for stats
  const [blogPosts, members, events] = await Promise.all([
    getBlogPosts(),
    getMembers(),
    getCalendarEvents(),
  ]);

  // Calculate stats
  const totalMembers = members.length;
  const totalBlogPosts = blogPosts.length;
  
  // Upcoming events (next 7 days)
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.isoDate);
    return eventDate >= now && eventDate <= nextWeek;
  }).length;

  // Recent blog posts (last 5)
  const recentPosts = blogPosts.slice(0, 5);

  const stats = [
    {
      name: 'Total Members',
      value: totalMembers,
      icon: UsersIcon,
      href: '/admin/members',
      color: 'bg-blue-500',
      description: 'Active members',
    },
    {
      name: 'Blog Posts',
      value: totalBlogPosts,
      icon: DocumentTextIcon,
      href: '/admin/blog',
      color: 'bg-green-500',
      description: 'Published articles',
    },
    {
      name: 'Upcoming Events',
      value: upcomingEvents,
      icon: CalendarDaysIcon,
      href: '/admin/events',
      color: 'bg-purple-500',
      description: 'Next 7 days',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your cycling club content and members
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Create New Post
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Blog Posts */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Blog Posts</h2>
            <Link
              href="/admin/blog"
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              View all →
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No blog posts yet.{' '}
                    <Link href="/admin/blog/new" className="text-red-600 hover:underline">
                      Create your first post
                    </Link>
                  </td>
                </tr>
              ) : (
                recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {post.coverImage && (
                            <img
                              src={post.coverImage}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-xs">
                            {post.title}
                          </p>
                          <p className="text-sm text-gray-500">{post.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {post.author}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          post.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-red-300 hover:bg-red-50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <PlusIcon className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">New Blog Post</p>
            <p className="text-sm text-gray-500">Write an article</p>
          </div>
        </Link>
        <Link
          href="/admin/members"
          className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <UsersIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Manage Members</p>
            <p className="text-sm text-gray-500">Add or edit members</p>
          </div>
        </Link>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-6 hover:border-purple-300 hover:bg-purple-50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">New Event</p>
            <p className="text-sm text-gray-500">Add to calendar</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
