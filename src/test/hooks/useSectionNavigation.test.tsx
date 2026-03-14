import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import {
  useSectionHashScroll,
  useSectionNavigation,
} from '@/hooks/useSectionNavigation';

const scrollIntoViewMock = vi.fn();

const LocationDisplay = () => {
  const location = useLocation();

  return <div data-testid="location">{`${location.pathname}${location.hash}`}</div>;
};

const SectionTrigger = () => {
  const navigateToSection = useSectionNavigation();

  return (
    <button type="button" onClick={() => navigateToSection('projects')}>
      Go to projects
    </button>
  );
};

const HomeRoute = () => {
  useSectionHashScroll();

  return <div id="projects">Projects section</div>;
};

describe('useSectionNavigation', () => {
  beforeEach(() => {
    scrollIntoViewMock.mockReset();
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock as typeof HTMLElement.prototype.scrollIntoView;
  });

  it('navigates from a non-home route to the home hash and scrolls after the section exists', async () => {
    render(
      <MemoryRouter initialEntries={['/games']}>
        <LocationDisplay />
        <Routes>
          <Route path="/games" element={<SectionTrigger />} />
          <Route
            path="/"
            element={(
              <>
                <SectionTrigger />
                <HomeRoute />
              </>
            )}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /go to projects/i }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/#projects');
    });

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    });
  });

  it('scrolls immediately when the user is already on the matching home hash', () => {
    render(
      <MemoryRouter initialEntries={['/#projects']}>
        <LocationDisplay />
        <Routes>
          <Route
            path="/"
            element={(
              <>
                <SectionTrigger />
                <div id="projects">Projects section</div>
              </>
            )}
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /go to projects/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/#projects');
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
  });
});
