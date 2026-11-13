import { router } from 'expo-router';
import { SendHorizonal, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAnalytics } from '@/analytics';
import {
  Banner,
  Button,
  Chip,
  IconButton,
  PageHeader,
  Text,
  announce,
  useMotionPreference,
  useTheme,
} from '@/design-system';
import { useExperiment } from '@/experiments';
import { useActivityStore } from '@/features/activity/store';
import { COACH_API_URL } from '@/features/coach/client';
import { MessageBubble } from '@/features/coach/MessageBubble';
import { useCoachStore } from '@/features/coach/store';
import type { CoachAction, CoachMessage } from '@/features/coach/types';
import { useCoachContext } from '@/features/coach/useCoachContext';

const SUGGESTIONS = [
  'What should I do in 15 minutes?',
  "I'm tired today",
  'Help me sleep better',
  'How much water is left?',
];

export default function Coach() {
  const { colors, spacing, radii, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useMotionPreference();
  const analytics = useAnalytics();
  const ctx = useCoachContext();
  const messages = useCoachStore((s) => s.messages);
  const busy = useCoachStore((s) => s.busy);
  const send = useCoachStore((s) => s.send);
  const clear = useCoachStore((s) => s.clear);
  const addActivity = useActivityStore((s) => s.add);
  const chips = useExperiment('coach_suggestion_chips');
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<CoachMessage>>(null);
  const followLatest = useRef(true);
  const [showLatest, setShowLatest] = useState(false);

  useEffect(() => {
    analytics.track('coach_opened', { source: 'tab' });
  }, [analytics]);

  const submit = useCallback(
    (text: string, suggestion = false) => {
      if (!text.trim() || busy) return;
      followLatest.current = true;
      setShowLatest(false);
      setDraft('');
      analytics.track('coach_message_sent', {
        chars: text.trim().length,
        suggestion_used: suggestion,
      });
      void send(text, ctx, (m) => {
        if (m.error && !m.fallback) analytics.track('coach_response_failed', { reason: m.error });
        analytics.track('coach_response_received', {
          latency_ms: m.latencyMs,
          streamed: m.streamed,
          fallback: m.fallback,
        });
        const last = useCoachStore.getState().messages.at(-1);
        if (last?.role === 'assistant') announce(`Coach: ${last.text}`);
      });
    },
    [busy, send, ctx, analytics],
  );

  const onAction = (a: CoachAction) => {
    analytics.track('coach_action_tapped', { action: a.type });
    if (a.type === 'start_workout' && a.workoutId) {
      analytics.track('workout_viewed', { workout_id: a.workoutId, source: 'coach' });
      router.push({ pathname: '/workout/[id]', params: { id: a.workoutId } });
    } else if (a.type === 'log_water') {
      const ml = a.amountMl ?? 250;
      addActivity({ waterMl: ml });
      analytics.track('water_logged', { amount_ml: ml, total_ml: ctx.today.waterMl + ml });
      announce(`Logged ${ml} millilitres of water.`);
    } else if (a.type === 'open_insights') {
      router.push('/insights');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg.canvas }}
    >
      <View
        style={{
          paddingTop: insets.top + spacing['3'],
          paddingHorizontal: spacing['4'],
          width: '100%',
          maxWidth: 800,
          alignSelf: 'center',
        }}
      >
        <PageHeader
          title="A little guidance"
          eyebrow="YOUR COACH"
          subtitle={
            COACH_API_URL
              ? 'Talk through your next small step.'
              : 'Everyday tips, available offline.'
          }
          action={
            <IconButton icon={Trash2} accessibilityLabel="Clear conversation" onPress={clear} />
          }
        />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} onAction={onAction} />}
        contentContainerStyle={{
          padding: spacing['4'],
          gap: spacing['3'],
          maxWidth: 800,
          width: '100%',
          alignSelf: 'center',
        }}
        onContentSizeChange={() => {
          if (followLatest.current) listRef.current?.scrollToEnd({ animated: false });
        }}
        onScroll={({ nativeEvent }) => {
          const nearBottom =
            nativeEvent.contentSize.height -
              nativeEvent.layoutMeasurement.height -
              nativeEvent.contentOffset.y <
            100;
          followLatest.current = nearBottom;
          setShowLatest(!nearBottom);
        }}
        scrollEventThrottle={100}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          !COACH_API_URL ? (
            <Banner
              tone="info"
              message="You’re in offline mode. You can still get workout ideas and simple tips based on your day."
            />
          ) : undefined
        }
      />

      <View
        style={{
          paddingHorizontal: spacing['4'],
          paddingBottom: insets.bottom + spacing['2'],
          paddingTop: spacing['2'],
          gap: spacing['2'],
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
          backgroundColor: colors.bg.canvas,
          maxWidth: 800,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {showLatest ? (
          <Button
            label="Back to latest message"
            variant="secondary"
            size="sm"
            onPress={() => {
              followLatest.current = true;
              setShowLatest(false);
              listRef.current?.scrollToEnd({ animated: !reduceMotion });
            }}
          />
        ) : null}
        {busy ? (
          <Text variant="caption" color="secondary" accessibilityLiveRegion="polite">
            Your coach is replying…
          </Text>
        ) : null}
        {chips === 'chips' ? (
          <FlatList
            horizontal
            data={SUGGESTIONS}
            keyExtractor={(s) => s}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing['2'] }}
            renderItem={({ item }) => (
              <Chip label={item} role="button" onPress={() => submit(item, true)} disabled={busy} />
            )}
            accessibilityLabel="Suggested questions"
          />
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing['2'] }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask your coach…"
            placeholderTextColor={colors.fg.muted}
            accessibilityLabel="Message to coach"
            multiline
            maxLength={1000}
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={() => submit(draft)}
            editable={!busy}
            maxFontSizeMultiplier={typography.body.maxFontSizeMultiplier}
            style={{
              flex: 1,
              minHeight: 48,
              maxHeight: 120,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border.default,
              backgroundColor: colors.bg.surface,
              color: colors.fg.primary,
              paddingHorizontal: spacing['4'],
              paddingVertical: spacing['3'],
              fontSize: typography.body.fontSize,
            }}
          />
          <IconButton
            icon={SendHorizonal}
            variant="filled"
            accessibilityLabel="Send message"
            onPress={() => submit(draft)}
            disabled={busy || !draft.trim()}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
