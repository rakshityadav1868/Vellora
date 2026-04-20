import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { PHARMACIES } from '../data/mockData';
import { pickEmergencyPharmacy } from '../lib/search';
import type { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Emergency'>;

export function EmergencyScreen({ route, navigation }: Props) {
  const medicineQuery = route.params?.medicineQuery ?? 'Paracetamol';
  const best = pickEmergencyPharmacy(PHARMACIES, medicineQuery);

  if (!best) {
    return (
      <View style={styles.screen}>
        <Text style={styles.h1}>No pharmacies found</Text>
        <Text style={styles.sub}>Try a different medicine or remove filters.</Text>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.btnMuted}>
          <Text style={styles.btnMutedText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Go now</Text>
      <Text style={styles.sub}>Best match for “{medicineQuery}”</Text>

      <View style={styles.card}>
        <Text style={styles.name}>{best.name}</Text>
        <Text style={styles.meta}>
          {best.distanceKm.toFixed(1)} km • ETA {best.etaMin} min
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => Linking.openURL('https://maps.google.com/?q=pharmacy')}
          style={styles.bigCta}
        >
          <Text style={styles.bigCtaText}>Navigate</Text>
          <Text style={styles.bigCtaSub}>Turn-by-turn in Google Maps</Text>
        </Pressable>

        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('PharmacyDetail', { pharmacyId: best.id, medicineQuery })}
            style={styles.btnMuted}
          >
            <Text style={styles.btnMutedText}>Details</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => best.phone && Linking.openURL(`tel:${best.phone}`)}
            style={styles.btnMuted}
          >
            <Text style={styles.btnMutedText}>Call</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.note}>
        Emergency Mode hides everything except the fastest trusted option.
      </Text>
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
    fontSize: 26,
    fontWeight: '900',
  },
  sub: {
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  card: {
    marginTop: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  meta: {
    color: theme.colors.textSecondary,
    fontWeight: '800',
  },
  bigCta: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  bigCtaText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  bigCtaSub: {
    marginTop: 4,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  btnMuted: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
  },
  btnMutedText: {
    color: theme.colors.textPrimary,
    fontWeight: '900',
  },
  note: {
    marginTop: 'auto',
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
});
