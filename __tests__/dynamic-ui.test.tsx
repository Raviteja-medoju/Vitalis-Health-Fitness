import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import Nutrition from '@/app/(tabs)/nutrition';
import Workouts from '@/app/(tabs)/workouts';
import { ThemeProvider } from '@/design-system';
import { ActivityWeek } from '@/features/activity/ActivityWeek';
import { useActivityStore } from '@/features/activity/store';
import { MovementExplorer } from '@/features/landing/MovementExplorer';
import { useNutritionStore } from '@/features/nutrition/store';
import { WORKOUTS } from '@/features/workouts/catalog';
import { useWorkoutsStore } from '@/features/workouts/store';
import { addDays, todayKey, weekdayShort } from '@/lib/date';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));
jest.mock('@/analytics', () => ({ useAnalytics: () => ({ track: jest.fn() }) }));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

const themed = (children: React.ReactNode) => (
  <ThemeProvider initialPreference="light">{children}</ThemeProvider>
);

describe('Interactive layouts', () => {
  beforeEach(() => {
    useActivityStore.getState().reset();
    useWorkoutsStore.getState().reset();
    useNutritionStore.getState().reset();
  });

  it('saves a workout, previews its exercises, and removes it from the saved collection', async () => {
    const workout = WORKOUTS[0]!;
    await render(themed(<Workouts />));
    await fireEvent.press(screen.getByRole('button', { name: `Save ${workout.title}` }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Saved' }));
    expect(screen.getAllByRole('button', { name: /^View .*min/ })).toHaveLength(1);
    expect(useWorkoutsStore.getState().savedIds).toEqual([workout.id]);
    await fireEvent.press(
      screen.getByRole('button', { name: `Preview exercises for ${workout.title}` }),
    );
    expect(screen.getByText(workout.exercises[0]!.cue, { exact: false })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: `Hide exercises for ${workout.title}` }).props
        .accessibilityState.expanded,
    ).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: `Unsave ${workout.title}` }));
    expect(screen.getByText('Keep your favorites close')).toBeTruthy();
  });

  it('keeps the selected day when switching activity metrics', async () => {
    const yesterday = addDays(todayKey(), -1);
    useActivityStore.getState().add({ steps: 1234, waterMl: 750 }, yesterday);
    await render(themed(<ActivityWeek />));
    await fireEvent.press(
      screen.getByRole('button', { name: `${weekdayShort(yesterday)} ${yesterday}, 1,234 steps` }),
    );
    expect(screen.getByText('1,234')).toBeTruthy();
    await fireEvent.press(screen.getByRole('radio', { name: 'Water' }));
    expect(screen.getByText('750')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: `${weekdayShort(yesterday)} ${yesterday}, 750 ml water` })
        .props.accessibilityState.selected,
    ).toBe(true);
  });

  it('removes and restores a historical meal without changing today’s calories', async () => {
    const yesterday = addDays(todayKey(), -1);
    useNutritionStore.getState().addMeal('Yesterday lunch', 400, yesterday);
    useActivityStore.getState().add({ kcalEaten: 400 }, yesterday);
    useActivityStore.getState().add({ kcalEaten: 150 });
    await render(themed(<Nutrition />));
    expect(screen.queryByText('Yesterday lunch')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: `Meals for ${yesterday}` }));
    expect(screen.getByText('Yesterday lunch')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Remove Yesterday lunch' }));
    expect(useActivityStore.getState().get(yesterday).kcalEaten).toBe(0);
    expect(useActivityStore.getState().get().kcalEaten).toBe(150);
    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    expect(useActivityStore.getState().get(yesterday).kcalEaten).toBe(400);
    expect(screen.getByText('Yesterday lunch')).toBeTruthy();
  });

  it('updates the landing preview when a movement style is selected', async () => {
    const start = jest.fn();
    await render(themed(<MovementExplorer onStart={start} />));
    await fireEvent.press(screen.getByRole('radio', { name: 'Mindfulness' }));
    expect(screen.getByRole('header', { name: '5-min Box Breathing' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Build my routine' }));
    expect(start).toHaveBeenCalledTimes(1);
  });
});
