import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';

describe('Design system components honour the props the pages pass them', () => {
  it('applies a real class list for the widely used gold variant and xs size', () => {
    const { container } = render(<Button variant="gold" size="xs">Save</Button>);
    const cls = container.querySelector('button').className;
    expect(cls).not.toContain('undefined');
    expect(cls).toContain('bg-gold-500');
  });

  it('renders a status badge from the status prop', () => {
    render(<Badge status="CONFIRMED" />);
    expect(screen.getByText(/Confirmed/i)).toBeInTheDocument();
  });

  it('renders modal footer actions so Save/Cancel are reachable', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Create Package" footer={<button>Save</button>}>
        <p>Body</p>
      </Modal>
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/close dialog/i));
    expect(onClose).toHaveBeenCalled();
  });

  it('honours Card padding and headerAction props', () => {
    const { container } = render(
      <Card title="Ledger" padding="p-4" headerAction={<button>Add</button>}>
        rows
      </Card>
    );
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(container.querySelector('.p-4')).toBeTruthy();
  });
});
