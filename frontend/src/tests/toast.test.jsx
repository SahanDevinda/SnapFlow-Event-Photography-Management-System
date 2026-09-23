import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider, useToast } from '../context/ToastContext';

const Probe = () => {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Saved!')}>short</button>
      <button onClick={() => toast.showError('Broken')}>long</button>
    </div>
  );
};

describe('Toast context', () => {
  it('supports both toast.success(...) and showSuccess(...) call styles', () => {
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('short'));
    expect(screen.getByText('Saved!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('long'));
    expect(screen.getByText('Broken')).toBeInTheDocument();
  });
});
