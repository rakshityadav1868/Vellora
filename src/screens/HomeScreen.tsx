import { FlashList } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Chip } from '../components/Chip';
import { PharmacyCard } from '../components/PharmacyCard';
import { PHARMACIES } from '../data/mockData';
import { searchPharmacies } from '../lib/search';
import type { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';
import type { Pharmacy } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState('Paracetamol');
  const [filterOpenNow, setFilterOpenNow] = useState(true);
  const [filter247, setFilter247] = useState(false);

  const results = useMemo(
    () =>
      searchPharmacies(PHARMACIES, query, {
        openNow: filterOpenNow,
        is247: filter247,
      }),
    [query, filterOpenNow, filter247]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Enter medicine"
          placeholderTextColor={theme.colors.textSecondary}
          style={styles.search}
          returnKeyType="search"
          onSubmitEditing={() => navigation.navigate('Search', { initialQuery: query })}
        />
        <Pressable
          onPress={() => navigation.navigate('Search', { initialQuery: query })}
          style={styles.searchBtn}
          accessibilityRole="button"
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </Pressable>
      </View>

      <View style={styles.chips}>
        <Chip
          label="Open Now"
          selected={filterOpenNow}
          onPress={() => setFilterOpenNow((v) => !v)}
        />
        <Chip
          label="24/7"
          selected={filter247}
          onPress={() => setFilter247((v) => !v)}
        />
        <Chip label="Distance" />
        <Chip label="Fastest" />
      </View>

      <Pressable
        onPress={() => navigation.navigate('Emergency', { medicineQuery: query })}
        style={styles.emergency}
        accessibilityRole="button"
      >
        <Text style={styles.emergencyTitle}>Emergency Mode</Text>
        <Text style={styles.emergencySub}>2 taps to navigation • No distractions</Text>
      </Pressable>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Map view (placeholder)</Text>
      </View>

      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Nearby pharmacies</Text>
        <Text style={styles.sheetMeta}>{results.length} results</Text>
      </View>

      <FlashList
  data={results as Pharmacy[]}
  keyExtractor={(p: Pharmacy) => p.id}
  // FlashList typings can drift across versions; keep the perf hint without blocking builds.
  {...({ estimatedItemSize: 120 } as any)}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
  renderItem={({ item }: { item: Pharmacy }) => (
          <PharmacyCard
            pharmacy={item}
            medicineQuery={query}
            onPress={() =>
              navigation.navigate('PharmacyDetail', {
                pharmacyId: item.id,
                medicineQuery: query,
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
  searchRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  search: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: '#FFFFFF',
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  searchBtn: {
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primary,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  emergency: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
  },
  emergencyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  emergencySub: {
    marginTop: 4,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '700',
  },
  mapPlaceholder: {
    height: 140,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: theme.colors.textSecondary,
    fontWeight: '800',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '900',
  },
  sheetMeta: {
    color: theme.colors.textSecondary,
    fontWeight: '800',
  },
});
