import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { Button, Chip, Input, ProgressRing, ThemeProvider, lightTheme } from '@/design-system';

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider initialPreference="light">{ui}</ThemeProvider>);

describe('Button', () => {
  it('renders its primary background and updates it when pressed', async () => {
    await wrap(<Button label="Get started" />);
    const btn = screen.getByRole('button', { name: 'Get started' });
    expect(btn).toHaveStyle({ backgroundColor: lightTheme.colors.action.primary });
    await fireEvent(btn, 'pressIn');
    expect(btn).toHaveStyle({ backgroundColor: lightTheme.colors.action.primaryPressed });
    await fireEvent(btn, 'pressOut');
    expect(btn).toHaveStyle({ backgroundColor: lightTheme.colors.action.primary });
  });

  it('exposes role, label and state', async () => {
    const onPress = jest.fn();
    await wrap(<Button label="Continue" onPress={onPress} />);
    const btn = screen.getByRole('button', { name: 'Continue' });
    await fireEvent.press(btn);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is not pressable while loading and announces busy', async () => {
    const onPress = jest.fn();
    await wrap(<Button label="Save" loading onPress={onPress} />);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toBeDisabled();
    expect(btn).toBeBusy();
    await fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Chip', () => {
  it('reports checked state for multi-select', async () => {
    await wrap(<Chip label="Lose weight" selected role="checkbox" />);
    expect(screen.getByRole('checkbox', { name: 'Lose weight' })).toBeChecked();
  });
});

describe('Input', () => {
  it('links label and surfaces errors as alerts', async () => {
    await wrap(
      <Input
        label="Height"
        value=""
        onChangeText={() => {}}
        errorText="Enter a realistic height."
      />,
    );
    expect(screen.getByLabelText('Height')).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a realistic height.');
  });
});

describe('ProgressRing', () => {
  it('exposes an accessible progressbar with value', async () => {
    await wrap(
      <ProgressRing
        value={0.642}
        accessibilityLabel="Steps"
        accessibilityValueText="6,420 of 10,000 steps"
      />,
    );
    const ring = screen.getByRole('progressbar', { name: 'Steps' });
    expect(ring.props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 64,
      text: '6,420 of 10,000 steps',
    });
  });

  it('caps the reported value at 100 when over goal', async () => {
    await wrap(<ProgressRing value={1.3} accessibilityLabel="Water" />);
    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(100);
  });
});
