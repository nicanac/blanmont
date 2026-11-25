/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AdminGroupesPage from '@/app/admin/groupes/page';
import { GroupLabelsProvider, useGroupLabels } from '@/app/context/GroupLabelsContext';
import GroupName from '@/app/components/shared/GroupName';
import { DEFAULT_GROUP_SETTINGS } from '@/app/constants/groups';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
  usePathname: () => '/admin/groupes',
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...a: unknown[]) => toastSuccess(...a),
    error: (...a: unknown[]) => toastError(...a),
  },
}));

const initial = {
  settings: {
    groups: [
      { code: 'A', label: 'A' },
      { code: 'A-', label: 'A-' },
      { code: 'B', label: 'B' },
      { code: 'C', label: 'C' },
    ],
  },
  usage: {
    A: { code: 'A', count: 14 },
    'A-': { code: 'A-', count: 3 },
    B: { code: 'B', count: 9 },
    C: { code: 'C', count: 1 },
    D: { code: 'D', count: 2 },
  },
};

/** Shows the label the rest of the app would render for code A. */
function LabelProbe(): React.ReactElement {
  const { label } = useGroupLabels();
  return <span data-testid="probe">{label('A')}</span>;
}

const renderPage = (): void => {
  render(
    <GroupLabelsProvider initialSettings={DEFAULT_GROUP_SETTINGS}>
      <AdminGroupesPage />
      <LabelProbe />
    </GroupLabelsProvider>
  );
};

describe('Admin Groupes page (/admin/groupes)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    refresh.mockClear();
    toastSuccess.mockClear();
    toastError.mockClear();
    fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        const body = JSON.parse(String(init.body));
        return new Response(JSON.stringify({ success: true, settings: body }), { status: 200 });
      }
      return new Response(JSON.stringify(initial), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lists configured groups with their usage and the unconfigured codes', async () => {
    renderPage();
    const inputs = await screen.findAllByLabelText('Nom affiché');
    expect(inputs.map((i) => (i as HTMLInputElement).value)).toEqual(['A', 'A-', 'B', 'C']);
    expect(screen.getByText('14')).toBeInTheDocument();
    // D is used in the data but not configured: offered as a one-click add
    expect(screen.getByRole('button', { name: /D\s*· 2/ })).toBeInTheDocument();
    // Nothing changed yet: save disabled
    expect(screen.getByRole('button', { name: 'Enregistrer les groupes' })).toBeDisabled();
  });

  it('renames A→GR1, B→gr2, C→gr3, saves and updates labels app-wide', async () => {
    renderPage();
    const inputs = await screen.findAllByLabelText('Nom affiché');
    fireEvent.change(inputs[0], { target: { value: 'GR1' } });
    fireEvent.change(inputs[2], { target: { value: 'gr2' } });
    fireEvent.change(inputs[3], { target: { value: 'gr3' } });

    const save = screen.getByRole('button', { name: 'Enregistrer les groupes' });
    expect(save).toBeEnabled();
    fireEvent.click(save);

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    const putCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(JSON.parse(String(putCall?.[1]?.body))).toEqual({
      groups: [
        { code: 'A', label: 'GR1' },
        { code: 'A-', label: 'A-' },
        { code: 'B', label: 'gr2' },
        { code: 'C', label: 'gr3' },
      ],
    });
    expect(screen.getByTestId('probe')).toHaveTextContent('GR1');
    expect(refresh).toHaveBeenCalled();
  });

  it('blocks saving duplicate names and explains how to fix it', async () => {
    renderPage();
    const inputs = await screen.findAllByLabelText('Nom affiché');
    fireEvent.change(inputs[0], { target: { value: 'B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer les groupes' }));

    expect(await screen.findAllByText(/déjà utilisé par un autre groupe/)).toHaveLength(2);
    expect(inputs[0]).toHaveAttribute('aria-invalid', 'true');
    expect(inputs[2]).toHaveAttribute('aria-invalid', 'true');
    expect(inputs[0]).toHaveFocus();
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false);
  });

  it('reorders groups and announces the move once', async () => {
    renderPage();
    await screen.findAllByLabelText('Nom affiché');
    fireEvent.click(screen.getByRole('button', { name: 'Descendre A' }));
    const inputs = screen.getAllByLabelText('Nom affiché') as HTMLInputElement[];
    expect(inputs.map((i) => i.value)).toEqual(['A-', 'A', 'B', 'C']);
    expect(screen.getByRole('status')).toHaveTextContent('A déplacé en position 2 sur 4.');
    expect(screen.getByRole('button', { name: 'Monter A-' })).toBeDisabled();
  });

  it('adds an unconfigured code and removes a group', async () => {
    renderPage();
    await screen.findAllByLabelText('Nom affiché');
    fireEvent.click(screen.getByRole('button', { name: /D\s*· 2/ }));
    expect(
      (screen.getAllByLabelText('Nom affiché') as HTMLInputElement[]).map((i) => i.value)
    ).toContain('D');

    fireEvent.click(screen.getByRole('button', { name: 'Retirer le groupe C de la liste' }));
    expect(screen.queryByRole('button', { name: 'Retirer le groupe C de la liste' })).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Groupe C retiré de la liste.');
  });

  it('proposes the GR1–GR4 + VTT merge, applies it and still lets the admin rename', async () => {
    renderPage();
    await screen.findAllByLabelText('Nom affiché');
    expect(
      screen.getByRole('heading', { name: 'Proposition de regroupement' })
    ).toBeInTheDocument();
    // D is not a known code: left as stored
    expect(screen.getByText(/Codes non reconnus/)).toHaveTextContent('D');

    fireEvent.click(screen.getByRole('button', { name: 'Appliquer la proposition' }));
    const inputs = screen.getAllByLabelText('Nom affiché') as HTMLInputElement[];
    expect(inputs.map((i) => i.value)).toEqual(['GR1', 'GR2', 'GR3', 'GR4', 'VTT']);
    expect(screen.getByRole('status')).toHaveTextContent('Proposition appliquée.');
    // Applied: the panel goes away, A- now shows as a merged code of GR1
    expect(screen.queryByRole('heading', { name: 'Proposition de regroupement' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Détacher le code A- de GR1' })).toBeInTheDocument();

    // Renaming stays possible before saving
    fireEvent.change(inputs[2], { target: { value: 'Groupe 3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer les groupes' }));
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    const putCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(JSON.parse(String(putCall?.[1]?.body))).toEqual({
      groups: [
        { code: 'A', label: 'GR1', aliases: ['A-'] },
        { code: 'B', label: 'GR2' },
        { code: 'BC', label: 'Groupe 3' },
        { code: 'C', label: 'GR4' },
        { code: 'VTT', label: 'VTT' },
      ],
    });
  });

  it('merges an unattached code into a group and detaches it again', async () => {
    renderPage();
    await screen.findAllByLabelText('Nom affiché');
    fireEvent.change(screen.getByLabelText('Fusionner un code dans B'), {
      target: { value: 'D' },
    });
    expect(screen.getByRole('status')).toHaveTextContent('Code D fusionné dans B.');
    // D is attached now: no longer offered as a new group
    expect(screen.queryByRole('button', { name: /D\s*· 2/ })).toBeNull();
    // Usage of the row adds the merged code: B 9 + D 2
    expect(screen.getByText('11')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Détacher le code D de B' }));
    expect(screen.getByRole('status')).toHaveTextContent('Code D détaché de B.');
    expect(screen.getByRole('button', { name: /D\s*· 2/ })).toBeInTheDocument();
  });

  it('shows a retry action when loading fails', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 500 }));
    renderPage();
    expect(await screen.findByText(/Impossible de charger les groupes/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findAllByLabelText('Nom affiché')).toHaveLength(4);
  });
});

describe('GroupName', () => {
  it('renders the configured short and full names', () => {
    render(
      <GroupLabelsProvider
        initialSettings={{
          groups: [
            { code: 'A', label: 'GR1' },
            { code: 'B', label: 'B' },
          ],
        }}
      >
        <GroupName code="A" />|<GroupName code="B" variant="full" />|<GroupName code="A-" />
      </GroupLabelsProvider>
    );
    expect(document.body).toHaveTextContent('GR1|Groupe B|A-');
  });

  it('falls back to codes outside a provider', () => {
    render(<GroupName code="A" variant="full" />);
    expect(document.body).toHaveTextContent('Groupe A');
  });
});
