/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MemberCard from '@/app/features/members/components/MemberCard';
import type { Member } from '@/app/types';

vi.mock('next/image', () => ({
  default: ({ src, alt, fill: _fill, unoptimized: _unoptimized, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));
// The monogram fallback prints the territory sheet: not under test here.
vi.mock('@/app/components/carte/TerritoryMap', () => ({ default: () => null }));

const member = (photoUrl: string): Member =>
  ({
    id: 'm1',
    name: 'Dany Niset',
    role: ['Capitaine de route'],
    bio: '',
    photoUrl,
    photoPosition: 'center 20%',
  }) as Member;

describe('MemberCard portrait (#260)', () => {
  it('prints a Cloudinary portrait from a 1200 px rendition, never the raw upload', () => {
    const upload =
      'https://res.cloudinary.com/dizy3s5zh/image/upload/v1795693458/profiles/profile-m1.jpg';
    render(<ul><MemberCard member={member(upload)} /></ul>);

    const img = screen.getByRole('img', { name: 'Dany Niset' });
    expect(img).toHaveAttribute(
      'src',
      'https://res.cloudinary.com/dizy3s5zh/image/upload/c_limit,w_1200,f_auto,q_auto:good/v1795693458/profiles/profile-m1.jpg'
    );
    // The framing chosen in the admin is kept.
    expect(img).toHaveStyle({ objectPosition: 'center 20%' });
  });

  it('keeps any other photo URL as it is', () => {
    const external = 'https://lh3.googleusercontent.com/pw/abc=w1200';
    render(<ul><MemberCard member={member(external)} /></ul>);
    expect(screen.getByRole('img', { name: 'Dany Niset' })).toHaveAttribute('src', external);
  });

  it('prints each role badge once, without the plain membership (#262)', () => {
    render(
      <ul>
        <MemberCard
          member={{
            ...member(''),
            role: ['Member', 'Capitaine de Route', 'Membre du comité', 'Membre du comité', 'Trésorier', 'Treasurer'],
          }}
        />
      </ul>
    );
    expect(screen.getAllByText('Membre du comité')).toHaveLength(1);
    expect(screen.getByText('Trésorier')).toBeInTheDocument();
    expect(screen.queryByText('Treasurer')).not.toBeInTheDocument();
    expect(screen.getByText('Capitaine de Route')).toBeInTheDocument();
    expect(screen.queryByText('Member')).not.toBeInTheDocument();
  });

  it('prints the monogram when there is no real photo', () => {
    render(<ul><MemberCard member={member('/images/default-avatar.png')} /></ul>);
    expect(screen.queryByRole('img', { name: 'Dany Niset' })).not.toBeInTheDocument();
    expect(screen.getByText('DN')).toBeInTheDocument();
  });
});
