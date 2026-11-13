import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { ThemeProvider } from '@/design-system';
import { WellnessStory } from '@/features/landing/WellnessStory';
import { useSettingsStore } from '@/features/profile/settingsStore';

describe('Wellness showcase', () => {
  afterEach(() => useSettingsStore.getState().set({ reduceMotion: null }));

  it.each([false, true])(
    'keeps chapter navigation and the start action working with reduced motion %s',
    async (reduceMotion) => {
      useSettingsStore.getState().set({ reduceMotion });
      const start = jest.fn();
      await render(
        <ThemeProvider initialPreference="light">
          <WellnessStory onStart={start} />
        </ThemeProvider>,
      );
      await fireEvent.press(screen.getByRole('radio', { name: 'Nourish' }));
      expect(screen.getByRole('header', { name: 'Make room for balance.' })).toBeTruthy();
      expect(screen.getByText('Oatmeal & berries')).toBeTruthy();
      await fireEvent.press(screen.getByRole('radio', { name: 'Recover' }));
      expect(screen.getByRole('header', { name: 'Give yourself space.' })).toBeTruthy();
      expect(screen.queryByText('Oatmeal & berries')).toBeNull();
      await fireEvent.press(screen.getByRole('button', { name: 'Find my rhythm' }));
      expect(start).toHaveBeenCalledTimes(1);
    },
  );
});
