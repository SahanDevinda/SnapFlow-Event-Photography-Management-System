import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { describe, it, expect } from 'vitest';

const renderAt = (path) =>
  render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );

describe('SnapFlow Navigation Architecture', () => {
  it('renders public navbar with brand title on home route', async () => {
    renderAt('/');
    // findAllBy* waits for the initial data effects to settle (avoids act warnings).
    const matches = await screen.findAllByText(/Lanka Moments/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders login page with credentials inputs on /login', async () => {
    renderAt('/login');
    const headings = await screen.findAllByText(/Sign In/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/you@email\.com/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated user to login when attempting to access /customer/dashboard', async () => {
    renderAt('/customer/dashboard');
    const headings = await screen.findAllByText(/Sign In/i);
    expect(headings.length).toBeGreaterThan(0);
  });
});
