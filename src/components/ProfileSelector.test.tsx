import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSelector } from './ProfileSelector';
import type { User, Profile } from '@/lib/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: (props: React.PropsWithChildren<Record<string, unknown>>) => React.createElement('div', props, props.children),
  },
  AnimatePresence: (props: React.PropsWithChildren) => React.createElement(React.Fragment, null, props.children),
}));

// Mock icons
vi.mock('@phosphor-icons/react', () => ({
  Plus: () => React.createElement('span', { 'data-testid': 'icon-plus' }, 'Plus'),
  UserCircle: () => React.createElement('span', { 'data-testid': 'icon-user-circle' }, 'UserCircle'),
  SignOut: () => React.createElement('span', { 'data-testid': 'icon-signout' }, 'SignOut'),
}));

describe('ProfileSelector', () => {
  const user = userEvent.setup();

  const createTestUser = (profiles: Profile[] = []): User => ({
    id: 'user-1',
    email: 'test@example.com',
    githubLogin: 'testuser',
    avatarUrl: 'https://example.com/avatar.png',
    createdAt: Date.now(),
    profiles,
  });

  const createTestProfile = (overrides: Partial<Profile> = {}): Profile => ({
    id: 'profile-1',
    userId: 'user-1',
    nickname: 'TestProfile',
    createdAt: Date.now(),
    ...overrides,
  });

  const defaultProps = {
    user: createTestUser(),
    onSelectProfile: vi.fn(),
    onCreateProfile: vi.fn(),
    onLogout: vi.fn(),
  };

  it('should render user information', () => {
    render(<ProfileSelector {...defaultProps} />);

    expect(screen.getByText('Välj profil')).toBeInTheDocument();
    expect(screen.getByText('Inloggad som testuser')).toBeInTheDocument();
  });

  it('should render user avatar when available', () => {
    render(<ProfileSelector {...defaultProps} />);

    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.png');
    expect(avatar).toHaveAttribute('alt', 'testuser');
  });

  it('should render fallback icon when no avatar', () => {
    const userWithoutAvatar = createTestUser();
    userWithoutAvatar.avatarUrl = undefined;

    render(<ProfileSelector {...defaultProps} user={userWithoutAvatar} />);

    expect(screen.getByTestId('icon-user-circle')).toBeInTheDocument();
  });

  it('should render existing profiles', () => {
    const profiles = [
      createTestProfile({ id: 'profile-1', nickname: 'Profile 1' }),
      createTestProfile({ id: 'profile-2', nickname: 'Profile 2' }),
    ];

    render(<ProfileSelector {...defaultProps} user={createTestUser(profiles)} />);

    expect(screen.getByText('Profile 1')).toBeInTheDocument();
    expect(screen.getByText('Profile 2')).toBeInTheDocument();
  });

  it('should display profile initial in avatar', () => {
    const profiles = [createTestProfile({ nickname: 'MyProfile' })];

    render(<ProfileSelector {...defaultProps} user={createTestUser(profiles)} />);

    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('should call onSelectProfile when profile is clicked', async () => {
    const onSelectProfile = vi.fn();
    const profile = createTestProfile({ nickname: 'TestProfile' });

    render(
      <ProfileSelector
        {...defaultProps}
        user={createTestUser([profile])}
        onSelectProfile={onSelectProfile}
      />
    );

    await user.click(screen.getByText('TestProfile'));

    expect(onSelectProfile).toHaveBeenCalledWith(profile);
  });

  it('should open create profile dialog when clicking create card', async () => {
    render(<ProfileSelector {...defaultProps} />);

    // Find and click the create profile card (it's a div with "Skapa ny profil" text)
    const createCard = screen.getByText('Skapa ny profil').closest('[data-slot="card"]');
    expect(createCard).toBeInTheDocument();
    await user.click(createCard!);

    // Dialog should be open - look for dialog title
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should call onCreateProfile with nickname when form is submitted', async () => {
    const onCreateProfile = vi.fn();
    render(<ProfileSelector {...defaultProps} onCreateProfile={onCreateProfile} />);

    // Open dialog by clicking the create card
    const createCard = screen.getByText('Skapa ny profil').closest('[data-slot="card"]');
    await user.click(createCard!);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Type nickname using label
    const input = screen.getByLabelText(/smeknamn/i);
    await user.type(input, 'NewProfile');

    // Submit - button contains "Skapa profil" with icon
    const submitButton = screen.getByRole('button', { name: /skapa profil/i });
    await user.click(submitButton);

    expect(onCreateProfile).toHaveBeenCalledWith('NewProfile');
  });

  it('should not call onCreateProfile with empty nickname', async () => {
    const onCreateProfile = vi.fn();
    render(<ProfileSelector {...defaultProps} onCreateProfile={onCreateProfile} />);

    // Open dialog by clicking the create card
    const createCard = screen.getByText('Skapa ny profil').closest('[data-slot="card"]');
    await user.click(createCard!);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // The submit button should be disabled when input is empty
    const submitButton = screen.getByRole('button', { name: /skapa profil/i });
    expect(submitButton).toBeDisabled();

    // Try clicking anyway
    await user.click(submitButton);

    expect(onCreateProfile).not.toHaveBeenCalled();
  });

  it('should trim whitespace from nickname', async () => {
    const onCreateProfile = vi.fn();
    render(<ProfileSelector {...defaultProps} onCreateProfile={onCreateProfile} />);

    // Open dialog by clicking the create card
    const createCard = screen.getByText('Skapa ny profil').closest('[data-slot="card"]');
    await user.click(createCard!);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Type nickname with whitespace
    const input = screen.getByLabelText(/smeknamn/i);
    await user.type(input, '  TrimmedProfile  ');

    // Submit
    const submitButton = screen.getByRole('button', { name: /skapa profil/i });
    await user.click(submitButton);

    expect(onCreateProfile).toHaveBeenCalledWith('TrimmedProfile');
  });

  it('should close dialog after creating profile', async () => {
    render(<ProfileSelector {...defaultProps} />);

    // Open dialog by clicking the create card
    const createCard = screen.getByText('Skapa ny profil').closest('[data-slot="card"]');
    await user.click(createCard!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Type and submit
    const input = screen.getByLabelText(/smeknamn/i);
    await user.type(input, 'NewProfile');
    const submitButton = screen.getByRole('button', { name: /skapa profil/i });
    await user.click(submitButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should clear input after creating profile', async () => {
    render(<ProfileSelector {...defaultProps} />);

    // Open dialog by clicking the create card
    const createCard = screen.getByText('Skapa ny profil').closest('[data-slot="card"]');
    await user.click(createCard!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Type and submit
    const input = screen.getByLabelText(/smeknamn/i) as HTMLInputElement;
    await user.type(input, 'NewProfile');
    const submitButton = screen.getByRole('button', { name: /skapa profil/i });
    await user.click(submitButton);

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Open dialog again
    await user.click(createCard!);

    await waitFor(() => {
      const newInput = screen.getByLabelText(/smeknamn/i) as HTMLInputElement;
      expect(newInput.value).toBe('');
    });
  });

  it('should call onLogout when logout button is clicked', async () => {
    const onLogout = vi.fn();
    render(<ProfileSelector {...defaultProps} onLogout={onLogout} />);

    const logoutButton = screen.getByRole('button', { name: /logga ut/i });
    await user.click(logoutButton);

    expect(onLogout).toHaveBeenCalled();
  });

  it('should display creation date for each profile', () => {
    const profiles = [
      createTestProfile({ 
        nickname: 'TestProfile', 
        createdAt: new Date('2026-01-15').getTime() 
      }),
    ];

    render(<ProfileSelector {...defaultProps} user={createTestUser(profiles)} />);

    // The date should be formatted in Swedish locale
    expect(screen.getByText(/skapad/i)).toBeInTheDocument();
  });
});
