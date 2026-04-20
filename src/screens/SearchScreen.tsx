import { FlashList } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Chip } from '../components/Chip';
import { PharmacyCard } from '../components/PharmacyCard';
import { PHARMACIES } from '../data/mockData';
import { searchPharmacies } from '../lib/search';
import {
  getAutocompleteSuggestions,
  maybeCorrectSpelling,
} from '../lib/suggest';
import type { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import type { Pharmacy } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export function SearchScreen({ navigation, route }: Props) {
  const initialQuery = route.params?.initialQuery ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [openNow, setOpenNow] = useState(true);
  const [suggestionPicked, setSuggestionPicked] = useState(false);

  const corrected = useMemo(() => maybeCorrectSpelling(query), [query]);
  const finalQuery = corrected && !suggestionPicked ? corrected : query;

  const results = useMemo(
    () => searchPharmacies(PHARMACIES, finalQuery, { openNow }),
    [finalQuery, openNow]
  );

  const suggestions = useMemo(
    () => getAutocompleteSuggestions(query),
    [query]
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Find medicine</Text>
      <Text style={styles.sub}>
        Type a medicine name. Results update in real-time.
      </Text>

      <TextInput
        value={query}
        onChangeText={(v) => {
          setQuery(v);
          setSuggestionPicked(false);
        }}
        placeholder="e.g., Paracetamol"
        placeholderTextColor={theme.colors.textSecondary}
        style={styles.search}
        autoCapitalize="none"
      />

      <View style={styles.chips}>
        <Chip label="Open Now" selected={openNow} onPress={() => setOpenNow((v) => !v)} />
        <Chip label="Nearest" />
        <Chip label="Fastest" />
        <Chip label="Cheapest" />
      </View>

      {corrected && corrected !== query && !suggestionPicked ? (
        <View style={styles.corrected}>
          <Text style={styles.correctedText}>
            Showing results for <Text style={{ fontWeight: '900' }}>{corrected}</Text>
          </Text>
          <Pressable onPress={() => setSuggestionPicked(true)}>
            <Text style={styles.link}>Search instead for “{query}”</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suggestions</Text>
      </View>
      <View style={styles.suggestionRow}>
        {suggestions.slice(0, 6).map((s) => (
          <Pressable
            key={s}
            onPress={() => {
              setQuery(s);
              setSuggestionPicked(true);
            }}
            style={styles.suggestion}
          >
            <Text style={styles.suggestionText}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Results</Text>
        <Text style={styles.sectionMeta}>{results.length}</Text>
      </View>

      <FlashList
        data={results as Pharmacy[]}
        keyExtractor={(p: Pharmacy) => p.id}
        {...({ estimatedItemSize: 120 } as any)}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
        renderItem={({ item }: { item: Pharmacy }) => (
          <PharmacyCard
            pharmacy={item}
            medicineQuery={finalQuery}
            onPress={() =>
              navigation.navigate('PharmacyDetail', {
                pharmacyId: item.id,
                medicineQuery: finalQuery,
              })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  h1: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  sub: {
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  search: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: '#FFFFFF',
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  corrected: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  correctedText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  link: {
    marginTop: theme.spacing.xs,
    color: theme.colors.primary,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '900',
  },
  sectionMeta: {
    color: theme.colors.textSecondary,
    fontWeight: '800',
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  suggestion: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestionText: {
    fontWeight: '800',
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
});
