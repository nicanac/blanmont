/**
 * Seed script to populate the Firebase database with sample blog posts.
 *
 * Usage:
 *   npx tsx scripts/seed-blog.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { getAdminDatabase } from '../app/lib/firebase/admin';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  category: string;
  slug: string;
  isPublished: boolean;
}

const samplePosts: Omit<BlogPost, 'id'>[] = [
  {
    title: 'Sustainable Cycling Practices',
    excerpt:
      'Eco-friendly initiatives to make cycling organizations about footprint, prioritizing sustainability and benefits that matter most to the environment.',
    content: `
# Sustainable Cycling Practices

Cycling is already one of the most eco-friendly modes of transportation, but there's always room for improvement. Here are some practices we're implementing at Blanmont Cycling Club to minimize our environmental footprint.

## Equipment Maintenance

Regular maintenance extends the life of your cycling equipment. We host quarterly workshops where members learn to service their own bikes, reducing the need for replacement parts.

## Group Rides

By organizing group rides, we reduce the number of cars driving to remote starting points. Our carpooling initiative has cut our collective carbon emissions by 40%.

## Trail Preservation

We partner with local conservation groups to maintain trails and ensure our routes don't damage sensitive ecosystems.

Join us in making cycling even more sustainable!
    `,
    coverImage: '/images/IMG_5777.JPG',
    author: 'Jerry Todd',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2024-11-22T10:00:00Z',
    category: 'Environment',
    slug: 'sustainable-cycling-practices',
    isPublished: true,
  },
  {
    title: 'How We Plan Cycling Events',
    excerpt:
      'How we plan cycling events in our event planning, and we brainstorm and deliver bring event results about testing in the world.',
    content: `
# How We Plan Cycling Events

Planning a successful cycling event requires careful coordination and attention to detail. Here's a behind-the-scenes look at how Blanmont Cycling Club organizes our signature events.

## Route Selection

Every event starts with route scouting. Our experienced riders test potential routes for safety, scenic value, and appropriate difficulty levels.

## Safety First

We coordinate with local authorities and emergency services. Each event has designated safety marshals and support vehicles.

## Community Engagement

We partner with local businesses for refreshments and promote the event through our network of cycling enthusiasts.

## Post-Event Analysis

After each event, we gather feedback to continuously improve our planning process.
    `,
    coverImage: '/images/IMG_7627.JPG',
    author: 'Jerry Todd',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2024-11-22T09:00:00Z',
    category: 'Events',
    slug: 'how-we-plan-cycling-events',
    isPublished: true,
  },
  {
    title: 'Essential Cycling Gear Checklist',
    excerpt:
      'Best cycling gear checklist to care on with your gear from maintaining, shoes oil chains, matching, personality, your cycling & also cycles.',
    content: `
# Essential Cycling Gear Checklist

Whether you're a beginner or seasoned cyclist, having the right gear makes all the difference. Here's our comprehensive checklist.

## Safety Equipment

- **Helmet**: Non-negotiable. Replace after any impact.
- **Lights**: Front and rear, even for daytime rides.
- **Reflective Gear**: Be visible in all conditions.

## Clothing

- **Padded Shorts**: Comfort on long rides.
- **Moisture-Wicking Jersey**: Stay dry and comfortable.
- **Cycling Gloves**: Grip and protection.

## Tools & Accessories

- **Multi-Tool**: For trailside repairs.
- **Spare Tubes & Patch Kit**: Be prepared for flats.
- **Mini Pump or CO2 Inflator**: Get back on the road quickly.

## Nutrition

- **Water Bottles**: Stay hydrated.
- **Energy Bars/Gels**: Fuel for longer rides.

Happy cycling!
    `,
    coverImage: '/images/IMG_8019.JPG',
    author: 'Sara Brook',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2023-05-18T14:00:00Z',
    category: 'Gear',
    slug: 'essential-cycling-gear-checklist',
    isPublished: true,
  },
  {
    title: 'Health Benefits of Cycling',
    excerpt:
      'Physical and mental health fit that can be quite healthy to protect the advantage and sustain skill locations to done during several treks.',
    content: `
# Health Benefits of Cycling

Cycling is more than just a sport—it's a complete wellness activity that benefits both body and mind.

## Physical Benefits

### Cardiovascular Health
Regular cycling strengthens your heart, lowers resting pulse, and reduces blood fat levels.

### Muscle Strength
Cycling builds strength in your legs, core, and even upper body when climbing.

### Weight Management
A moderate cycling session can burn 400-600 calories per hour.

### Low Impact
Unlike running, cycling is gentle on your joints while still providing an excellent workout.

## Mental Benefits

### Stress Relief
The rhythmic nature of cycling combined with outdoor exposure reduces cortisol levels.

### Better Sleep
Regular cyclists report improved sleep quality and duration.

### Social Connection
Group rides foster community and combat feelings of isolation.

Start pedaling towards better health today!
    `,
    coverImage: '/images/43c794a0-380b-46e6-9d9d-bdad069d8fb7.jpg',
    author: 'Jerry Todd',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2024-11-22T08:00:00Z',
    category: 'Health',
    slug: 'health-benefits-of-cycling',
    isPublished: true,
  },
  {
    title: 'Training Tips for Long-Distance Rides',
    excerpt:
      'Prepare yourself for century rides and beyond with our proven training methodology and nutrition strategies.',
    content: `
# Training Tips for Long-Distance Rides

Completing a century ride (100km or 100 miles) is a milestone for many cyclists. Here's how to prepare.

## Build Your Base

Start with shorter rides and gradually increase distance. Add no more than 10% to your weekly mileage.

## Interval Training

Mix in high-intensity intervals to build power and endurance. Try 4x4 minute efforts at 90% max heart rate.

## Nutrition Strategy

- Practice eating on the bike
- Aim for 60-90g of carbs per hour during long rides
- Stay hydrated—drink before you're thirsty

## Recovery

Rest days are when you get stronger. Include at least 2 easy or rest days per week.

## Mental Preparation

Long rides are as much mental as physical. Break the distance into manageable segments.

See you at the century!
    `,
    coverImage: '/images/6efc2d5e-2326-446d-98d8-47889f881454.jpg',
    author: 'Marc Dupont',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2024-10-15T12:00:00Z',
    category: 'Training',
    slug: 'training-tips-long-distance-rides',
    isPublished: true,
  },
  {
    title: 'Exploring the Walloon Brabant Routes',
    excerpt:
      'Discover the hidden gems of our local cycling territory with routes through rolling hills, quiet villages, and scenic farmland.',
    content: `
# Exploring the Walloon Brabant Routes

The Walloon Brabant region offers some of the best cycling terrain in Belgium. Here are our favorite routes from the Blanmont area.

## The Mehaigne Valley Loop

**Distance**: 65km | **Elevation**: 650m

This route takes you through the picturesque Mehaigne valley with stunning views and challenging climbs.

## The Ardennes Foothills

**Distance**: 85km | **Elevation**: 900m

For those seeking a challenge, this route ventures into the foothills with punchy climbs and fast descents.

## The Abbey Circuit

**Distance**: 45km | **Elevation**: 400m

A more relaxed ride passing historic abbeys and charming villages. Perfect for a Sunday morning spin.

## The Plateau Ride

**Distance**: 55km | **Elevation**: 500m

Rolling terrain across the agricultural plateau with big skies and minimal traffic.

All routes are available on our Traces page with GPX downloads.
    `,
    coverImage: '/images/05ca4f92-29d6-43e0-9c6c-ee69d86ecd29.jpg',
    author: 'Nicolas Bruyère',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2024-09-20T10:00:00Z',
    category: 'Routes',
    slug: 'exploring-walloon-brabant-routes',
    isPublished: true,
  },
];

async function seedBlogPosts() {
  if (!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
    console.error('Firebase configuration is missing. Please set environment variables.');
    process.exit(1);
  }

  try {
    const db = getAdminDatabase();
    console.log('Using Firebase Admin SDK.');

    console.log('Seeding blog posts...\n');

    const blogRef = db.ref('blog');

    // Clear existing (optional, commented out to avoid deleting user data if any)
    // await blogRef.remove();

    for (const post of samplePosts) {
      // Check if post already exists by slug to avoid duplicates
      const snapshot = await blogRef.orderByChild('slug').equalTo(post.slug).once('value');

      if (snapshot.exists()) {
        console.log(`- Skipped: ${post.title} (already exists)`);
        continue;
      }

      const newPostRef = blogRef.push();
      const newPost: BlogPost = {
        ...post,
        id: newPostRef.key!,
      };
      await newPostRef.set(newPost);
      console.log(`✓ Created: ${post.title}`);
    }

    console.log('\n✅ Successfully seeded 6 blog posts!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding blog posts:', error);
    process.exit(1);
  }
}

seedBlogPosts();
