/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CookieConsentCartouche from '@/app/components/consent/CookieConsentCartouche';
import OpenCookiePreferencesButton from '@/app/components/consent/OpenCookiePreferencesButton';
import {
  getCookieConsent,
  saveCookieConsent,
  purgeConsent,
  triggerOpenConsentModal,
} from '@/app/lib/consent/cookieConsent';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('CookieConsentCartouche & Preferences Modal', () => {
  beforeEach(() => {
    localStorage.clear();
    purgeConsent();
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });

  it('renders cartouche on first visit when no consent exists', () => {
    render(<CookieConsentCartouche />);

    expect(
      screen.getByText(/Feuille de Blanmont · Respect de la vie privée/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tout accepter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refuser/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /personnaliser/i })).toBeInTheDocument();
  });

  it('does not render cartouche when consent is already recorded', () => {
    saveCookieConsent(true);
    render(<CookieConsentCartouche />);

    expect(
      screen.queryByText(/Feuille de Blanmont · Respect de la vie privée/i)
    ).not.toBeInTheDocument();
  });

  it('accepts all cookies upon clicking "Tout accepter"', () => {
    render(<CookieConsentCartouche />);

    const acceptBtn = screen.getByRole('button', { name: /tout accepter/i });
    fireEvent.click(acceptBtn);

    const consent = getCookieConsent();
    expect(consent).not.toBeNull();
    expect(consent?.analytics).toBe(true);
    expect(consent?.essential).toBe(true);

    expect(
      screen.queryByText(/Feuille de Blanmont · Respect de la vie privée/i)
    ).not.toBeInTheDocument();
  });

  it('refuses analytics cookies upon clicking "Refuser"', () => {
    render(<CookieConsentCartouche />);

    const refuseBtn = screen.getByRole('button', { name: /refuser/i });
    fireEvent.click(refuseBtn);

    const consent = getCookieConsent();
    expect(consent).not.toBeNull();
    expect(consent?.analytics).toBe(false);
    expect(consent?.essential).toBe(true);

    expect(
      screen.queryByText(/Feuille de Blanmont · Respect de la vie privée/i)
    ).not.toBeInTheDocument();
  });

  it('opens granular modal upon clicking "Personnaliser" and allows custom configuration', () => {
    render(<CookieConsentCartouche />);

    const customizeBtn = screen.getByRole('button', { name: /personnaliser/i });
    fireEvent.click(customizeBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Paramètres des Cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/Toujours actif/i)).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: /Mesure d'audience & Téléchargements GPX/i,
    });
    expect(checkbox).toBeInTheDocument();

    // Toggle analytics to false
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Save preferences
    const saveBtn = screen.getByRole('button', { name: /enregistrer mes choix/i });
    fireEvent.click(saveBtn);

    const consent = getCookieConsent();
    expect(consent).not.toBeNull();
    expect(consent?.analytics).toBe(false);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens modal on triggerOpenConsentModal or OpenCookiePreferencesButton even if banner is hidden', () => {
    saveCookieConsent(false);
    render(
      <>
        <CookieConsentCartouche />
        <OpenCookiePreferencesButton variant="button" />
      </>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const triggerBtn = screen.getByRole('button', {
      name: /modifier mes préférences de cookies/i,
    });
    fireEvent.click(triggerBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Paramètres des Cookies/i)).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByRole('button', { name: /fermer le panneau/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
