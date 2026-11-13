import { router } from 'expo-router';
import { Heart, Play, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';

import {
  Banner,
  Button,
  Card,
  Chip,
  IconButton,
  Input,
  ListItem,
  ProgressBar,
  ProgressRing,
  Screen,
  SegmentedControl,
  Skeleton,
  StatTile,
  Text,
  contrastRatio,
  useTheme,
  type TypographyVariant,
} from '@/design-system';

const TYPE: TypographyVariant[] = [
  'display',
  'title',
  'headline',
  'subhead',
  'body',
  'bodyStrong',
  'label',
  'caption',
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing['3'] }}>
      <Text variant="subhead" heading={2}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * Living pattern library. Mirrors the Figma component set 1:1 (names, variants, states)
 * so designers and engineers review the same artefact. Also doubles as a manual a11y test page.
 */
export default function DesignSystemGallery() {
  const { colors, spacing, scheme } = useTheme();
  const [chip, setChip] = useState<string[]>(['a']);
  const [seg, setSeg] = useState<'one' | 'two' | 'three'>('one');
  const [txt, setTxt] = useState('');

  const swatches = [
    ['action.primary', colors.action.primary, colors.fg.onBrand],
    ['bg.brandSubtle', colors.bg.brandSubtle, colors.fg.brand],
    ['bg.accentSubtle', colors.bg.accentSubtle, colors.fg.accent],
    ['bg.successSubtle', colors.bg.successSubtle, colors.fg.success],
    ['bg.warningSubtle', colors.bg.warningSubtle, colors.fg.warning],
    ['bg.dangerSubtle', colors.bg.dangerSubtle, colors.fg.danger],
    ['bg.surface', colors.bg.surface, colors.fg.primary],
    ['bg.subtle', colors.bg.subtle, colors.fg.secondary],
  ] as const;

  return (
    <Screen>
      <View style={{ gap: spacing['6'] }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View>
            <Text variant="title" heading={1}>
              Design system
            </Text>
            <Text variant="caption" color="muted">
              Mode: {scheme} · tokens.json v1
            </Text>
          </View>
          <IconButton icon={X} accessibilityLabel="Close" onPress={() => router.back()} />
        </View>

        <Section title="Color (with live contrast)">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
            {swatches.map(([name, bg, fg]) => (
              <View
                key={name}
                style={{
                  backgroundColor: bg,
                  padding: spacing['3'],
                  borderRadius: 12,
                  minWidth: 150,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                }}
              >
                <Text variant="label" color={fg}>
                  {name}
                </Text>
                <Text variant="caption" color={fg}>
                  {contrastRatio(fg, bg).toFixed(2)}:1
                </Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
            {(['move', 'energy', 'hydration', 'sleep'] as const).map((k) => (
              <View key={k} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View
                  style={{
                    width: '100%',
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: colors.data[k],
                  }}
                />
                <Text variant="caption" color="muted">
                  data.{k}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Typography">
          {TYPE.map((v) => (
            <Text key={v} variant={v}>
              {v} · The quick brown fox
            </Text>
          ))}
        </Section>

        <Section title="Buttons">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
            <Button label="Primary" onPress={() => {}} />
            <Button label="Secondary" variant="secondary" onPress={() => {}} />
            <Button label="Ghost" variant="ghost" onPress={() => {}} />
            <Button label="Danger" variant="danger" onPress={() => {}} />
            <Button label="Disabled" disabled onPress={() => {}} />
            <Button label="Loading" loading onPress={() => {}} />
            <Button label="With icon" leftIcon={Play} size="sm" onPress={() => {}} />
            <Button label="Large" size="lg" onPress={() => {}} />
            <IconButton
              icon={Heart}
              accessibilityLabel="Favourite"
              variant="tonal"
              onPress={() => {}}
            />
          </View>
        </Section>

        <Section title="Selection">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
            {['a', 'b', 'c'].map((id) => (
              <Chip
                key={id}
                label={`Option ${id.toUpperCase()}`}
                selected={chip.includes(id)}
                onPress={() =>
                  setChip((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
                }
              />
            ))}
          </View>
          <SegmentedControl
            accessibilityLabel="Demo segmented control"
            options={[
              { value: 'one', label: 'One' },
              { value: 'two', label: 'Two' },
              { value: 'three', label: 'Three' },
            ]}
            value={seg}
            onChange={setSeg}
          />
        </Section>

        <Section title="Inputs">
          <Input
            label="Email"
            value={txt}
            onChangeText={setTxt}
            placeholder="you@example.com"
            helperText="We never share this."
            keyboardType="email-address"
          />
          <Input
            label="With error"
            value="abc"
            errorText="Please enter a valid value."
            onChangeText={() => {}}
          />
          <Input label="Disabled" value="Read only" editable={false} onChangeText={() => {}} />
        </Section>

        <Section title="Progress & data">
          <View style={{ flexDirection: 'row', gap: spacing['4'], alignItems: 'center' }}>
            <ProgressRing
              value={0.72}
              accessibilityLabel="Demo ring"
              accessibilityValueText="72 percent"
            >
              <Text variant="label">72%</Text>
            </ProgressRing>
            <ProgressRing
              value={0.4}
              size={56}
              strokeWidth={8}
              color={colors.data.energy}
              accessibilityLabel="Small ring"
            />
            <View style={{ flex: 1, gap: spacing['2'] }}>
              <ProgressBar value={0.3} accessibilityLabel="Demo bar" />
              <ProgressBar
                value={0.8}
                color={colors.data.hydration}
                accessibilityLabel="Demo bar 2"
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
            <StatTile label="Steps" value="6,420" progress={0.8} goalText="Goal 8,000" />
            <StatTile label="Sleep" value="7.2" unit="h" color={colors.data.sleep} progress={0.9} />
          </View>
        </Section>

        <Section title="Feedback">
          <Banner tone="info" message="Informational banner." />
          <Banner tone="success" title="Saved" message="Your changes are stored on this device." />
          <Banner tone="warning" message="Heads up: this is a warning." />
          <Banner tone="danger" message="Something went wrong." />
          <View style={{ gap: spacing['2'] }}>
            <Skeleton height={20} width="60%" />
            <Skeleton height={14} />
            <Skeleton height={14} width="80%" />
          </View>
        </Section>

        <Section title="Lists & cards">
          <Card style={{ gap: 0 }}>
            <ListItem
              title="Pressable row"
              subtitle="With chevron"
              icon={Heart}
              onPress={() => {}}
            />
            <ListItem title="Static row" subtitle="No action" icon={Play} />
          </Card>
          <Card variant="brand">
            <Text variant="bodyStrong" color="brand">
              Brand card
            </Text>
          </Card>
          <Card variant="outline">
            <Text>Outline card</Text>
          </Card>
          <Card elevated>
            <Text>Elevated card</Text>
          </Card>
        </Section>
      </View>
    </Screen>
  );
}
