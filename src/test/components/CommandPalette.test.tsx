import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SafeThemeProvider } from '@/components/SafeThemeProvider';
import CommandPaletteProvider, { CommandPaletteTrigger } from '@/components/CommandPalette';
import { PROFILE } from '@/config/profile';

const { hotkeyCallbacks, windowOpenMock } = vi.hoisted(() => ({
  hotkeyCallbacks: [] as Array<(event: { preventDefault: () => void }) => void>,
  windowOpenMock: vi.fn(),
}));

vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: (_shortcut: string, handler: (event: { preventDefault: () => void }) => void) => {
    hotkeyCallbacks.push(handler);
  },
}));

const renderPalette = () =>
  render(
    <MemoryRouter>
      <SafeThemeProvider>
        <CommandPaletteProvider>
          <CommandPaletteTrigger />
        </CommandPaletteProvider>
      </SafeThemeProvider>
    </MemoryRouter>
  );

describe('CommandPalette', () => {
  beforeEach(() => {
    hotkeyCallbacks.length = 0;
    windowOpenMock.mockReset();
    vi.stubGlobal('open', windowOpenMock);
  });

  it('opens a single quick-actions dialog from the trigger', async () => {
    renderPalette();

    fireEvent.click(screen.getByRole('button', { name: /quick actions/i }));

    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('heading', { name: 'Quick Actions' })).toBeInTheDocument();
    expect(within(dialog).getByText('Open GitHub')).toBeInTheDocument();
    expect(screen.queryByText(/yourusername/i)).not.toBeInTheDocument();
  });

  it('registers one Cmd/Ctrl+K handler and opens the same dialog', async () => {
    renderPalette();

    expect(hotkeyCallbacks).toHaveLength(1);

    act(() => {
      hotkeyCallbacks[0]({ preventDefault: vi.fn() });
    });

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Quick Actions' })).toBeInTheDocument();
  });

  it('uses the real GitHub profile action instead of a placeholder link', async () => {
    renderPalette();

    fireEvent.click(screen.getByRole('button', { name: /quick actions/i }));
    fireEvent.click(await screen.findByText('Open GitHub'));

    await waitFor(() => {
      expect(windowOpenMock).toHaveBeenCalledWith(
        PROFILE.githubUrl,
        '_blank',
        'noopener,noreferrer'
      );
    });
  });
});
