import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import Workouts from '@/app/(tabs)/workouts';
import Insights from '@/app/insights';
import { ThemeProvider } from '@/design-system';
import { useActivityStore } from '@/features/activity/store';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('@/analytics', () => ({ useAnalytics: () => ({ track: jest.fn() }) }));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

describe('Core UX flows', () => {
  it('recovers from an empty workout search without losing the library', async () => {
    await render(
      <ThemeProvider initialPreference="light">
        <Workouts />
      </ThemeProvider>,
    );
    const originalCount = screen.getByText(/workouts to explore/).props.children;
    await fireEvent.changeText(screen.getByLabelText('Search workouts'), 'no-such-workout');
    expect(screen.getByText('Let’s try a different mix')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByLabelText('Search workouts').props.value).toBe('');
    expect(screen.queryByText('Let’s try a different mix')).toBeNull();
    expect(screen.getByText(/workouts to explore/).props.children).toEqual(originalCount);
  });

  it('opens weekly insights with empty activity data without a render loop', async () => {
    useActivityStore.getState().reset();
    await render(
      <ThemeProvider initialPreference="light">
        <Insights />
      </ThemeProvider>,
    );
    expect(screen.getByRole('header', { name: 'This week' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Close insights' })).toBeTruthy();
  });
});
