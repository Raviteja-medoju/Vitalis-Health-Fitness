import { router } from 'expo-router';
import { Bookmark, Clock, Search, Trophy } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { useAnalytics } from '@/analytics';
import {
  Button,
  Card,
  Chip,
  Input,
  PageHeader,
  ResponsiveGrid,
  Screen,
  SegmentedControl,
  Text,
  useTheme,
} from '@/design-system';
import { WORKOUTS, type WorkoutCategory } from '@/features/workouts/catalog';
import { useWorkoutsStore } from '@/features/workouts/store';
import { WorkoutLibraryCard } from '@/features/workouts/WorkoutLibraryCard';

const CATEGORIES: { id: WorkoutCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'strength', label: 'Strength' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'mindfulness', label: 'Mindfulness' },
];

export default function Workouts() {
  const { colors, spacing } = useTheme();
  const analytics = useAnalytics();
  const [cat, setCat] = useState<WorkoutCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [shortOnly, setShortOnly] = useState(false);
  const [collection, setCollection] = useState<'explore' | 'saved'>('explore');
  const history = useWorkoutsStore((s) => s.history);
  const savedIds = useWorkoutsStore((s) => s.savedIds);
  const list = useMemo(
    () =>
      WORKOUTS.filter(
        (w) =>
          (cat === 'all' || w.category === cat) &&
          (!shortOnly || w.durationMin <= 15) &&
          (collection === 'explore' || savedIds.includes(w.id)) &&
          `${w.title} ${w.summary} ${w.category}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [cat, query, shortOnly, collection, savedIds],
  );
  const resetFilters = () => {
    setQuery('');
    setCat('all');
    setShortOnly(false);
    setCollection('explore');
  };

  return (
    <Screen wide>
      <View style={{ gap: spacing['5'] }}>
        <PageHeader
          title="Find your next move"
          eyebrow="YOUR WORKOUT LIBRARY"
          subtitle="Build strength. Find your flow. Make it your own."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <Card
            variant="brand"
            style={{
              flexGrow: 2,
              flexShrink: 1,
              flexBasis: 300,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Trophy size={32} color={colors.fg.brand} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="subhead">
                {history.length
                  ? `${history.length} sessions in your story`
                  : 'Your next chapter starts here'}
              </Text>
              <Text variant="caption" color="secondary">
                {history.length
                  ? `${Math.round(history.reduce((sum, session) => sum + session.elapsedS, 0) / 60)} minutes of time for yourself.`
                  : 'Guided sessions from 5 to 30 minutes. Every effort counts.'}
              </Text>
            </View>
          </Card>
          <Card
            style={{
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: 180,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Bookmark size={26} color={colors.fg.accent} />
            <View style={{ flex: 1 }}>
              <Text variant="metricSm">{savedIds.length}</Text>
              <Text variant="caption" color="secondary">
                Saved for your next session
              </Text>
            </View>
          </Card>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end' }}>
          <View style={{ flexGrow: 2, flexShrink: 1, flexBasis: 300 }}>
            <Input
              label="Search workouts"
              value={query}
              onChangeText={setQuery}
              placeholder="Try strength, mobility, or a quick reset"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
          <SegmentedControl
            accessibilityLabel="Workout collection"
            value={collection}
            onChange={setCollection}
            options={[
              { value: 'explore', label: 'Explore' },
              { value: 'saved', label: 'Saved' },
            ]}
            style={{ flexGrow: 1, flexShrink: 1, flexBasis: 220 }}
          />
        </View>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Filter by category"
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}
        >
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              role="radio"
              selected={cat === c.id}
              onPress={() => setCat(c.id)}
            />
          ))}
        </View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Text variant="label" color="secondary" accessibilityLiveRegion="polite">
            {list.length} {list.length === 1 ? 'workout' : 'workouts'} to explore
          </Text>
          <Chip
            label="15 minutes or less"
            icon={Clock}
            selected={shortOnly}
            onPress={() => setShortOnly((value) => !value)}
          />
        </View>
        <ResponsiveGrid animate minItemWidth={280} accessibilityRole="list">
          {list.map((workout) => (
            <WorkoutLibraryCard
              key={workout.id}
              workout={workout}
              completed={history.find((h) => h.workoutId === workout.id)?.endedAt}
              onOpen={() => {
                analytics.track('workout_viewed', { workout_id: workout.id, source: 'library' });
                router.push({ pathname: '/workout/[id]', params: { id: workout.id } });
              }}
            />
          ))}
        </ResponsiveGrid>
        {!list.length ? (
          <Card variant="subtle" style={{ alignItems: 'center', gap: 16, paddingVertical: 32 }}>
            {collection === 'saved' ? (
              <Bookmark size={28} color={colors.fg.brand} />
            ) : (
              <Search size={28} color={colors.fg.brand} />
            )}
            <Text variant="headline">
              {collection === 'saved' && !savedIds.length
                ? 'Keep your favorites close'
                : 'Let’s try a different mix'}
            </Text>
            <Text color="secondary" align="center">
              {collection === 'saved' && !savedIds.length
                ? 'Tap the bookmark on any workout to build your personal collection.'
                : 'No workouts match these filters. Clear them to see the full library.'}
            </Text>
            <Button label="Clear filters" variant="secondary" onPress={resetFilters} />
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}
