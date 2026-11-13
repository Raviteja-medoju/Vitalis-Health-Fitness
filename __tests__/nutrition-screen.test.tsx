import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import Nutrition from '@/app/(tabs)/nutrition';
import { ThemeProvider } from '@/design-system';
import { useActivityStore } from '@/features/activity/store';
import { useNutritionStore } from '@/features/nutrition/store';
import { useOnboardingStore } from '@/features/onboarding/store';

jest.mock('@/analytics', () => ({ useAnalytics: () => ({ track: jest.fn() }) }));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

describe('Nutrition screen', () => {
  beforeEach(() => {
    useNutritionStore.getState().reset();
    useActivityStore.getState().reset();
    useOnboardingStore.getState().reset();
  });

  it('renders an empty day and updates meals, calories, and water without a render loop', async () => {
    await render(
      <ThemeProvider initialPreference="light">
        <Nutrition />
      </ThemeProvider>,
    );

    expect(screen.getByRole('header', { name: 'Nutrition' })).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Log a meal' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: /Banana/ }));
    expect(screen.getByRole('header', { name: "Today's meals" })).toBeTruthy();
    expect(screen.getByText('Banana')).toBeTruthy();
    expect(useActivityStore.getState().get().kcalEaten).toBe(105);

    await fireEvent.press(screen.getByRole('button', { name: '+ 250 ml' }));
    expect(useActivityStore.getState().get().waterMl).toBe(250);

    await fireEvent.press(screen.getByRole('button', { name: 'Remove Banana' }));
    expect(screen.queryByText('Banana')).toBeNull();
    expect(useActivityStore.getState().get().kcalEaten).toBe(0);
    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByText('Banana')).toBeTruthy();
    expect(useActivityStore.getState().get().kcalEaten).toBe(105);
    expect(useNutritionStore.getState().meals).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
  });
});
