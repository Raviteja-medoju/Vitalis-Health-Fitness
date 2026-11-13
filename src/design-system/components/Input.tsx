import React, { forwardRef, useId, useState } from 'react';
import { Platform, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label: string;
  helperText?: string;
  errorText?: string;
  suffix?: string;
  /** Hide the visual label but keep it for assistive tech. */
  hideLabel?: boolean;
}

export const Input = forwardRef<React.ComponentRef<typeof TextInput>, InputProps>(function Input(
  {
    label,
    helperText,
    errorText,
    suffix,
    hideLabel,
    style,
    onFocus,
    onBlur,
    editable = true,
    ...rest
  },
  ref,
) {
  const { colors, component, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const id = useId();
  const invalid = Boolean(errorText);
  const borderColor = invalid
    ? colors.border.danger
    : focused
      ? colors.border.focus
      : colors.border.default;

  return (
    <View style={{ gap: spacing['1'] }}>
      {!hideLabel ? (
        <Text variant="label" color="secondary" nativeID={`${id}-label`}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          minHeight: component.input.height,
          paddingVertical: spacing['2'],
          borderRadius: component.input.radius,
          borderWidth: 2,
          borderColor,
          backgroundColor: editable ? colors.bg.surface : colors.bg.subtle,
          paddingHorizontal: spacing['4'],
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing['2'],
        }}
      >
        <TextInput
          ref={ref}
          {...rest}
          editable={editable}
          accessibilityLabel={label}
          accessibilityLabelledBy={hideLabel ? undefined : `${id}-label`}
          accessibilityHint={rest.accessibilityHint ?? helperText}
          accessibilityState={{ disabled: !editable }}
          aria-invalid={invalid}
          aria-describedby={errorText ? `${id}-error` : helperText ? `${id}-help` : undefined}
          placeholderTextColor={colors.fg.muted}
          maxFontSizeMultiplier={typography.body.maxFontSizeMultiplier}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              minWidth: 0,
              color: colors.fg.primary,
              fontSize: typography.body.fontSize,
              fontFamily: typography.body.fontFamily,
              paddingVertical: 0,
              ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
            },
            style,
          ]}
        />
        {suffix ? (
          <Text variant="label" color="muted">
            {suffix}
          </Text>
        ) : null}
      </View>
      {errorText ? (
        <Text
          variant="caption"
          color="danger"
          nativeID={`${id}-error`}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {errorText}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color="muted" nativeID={`${id}-help`}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});
