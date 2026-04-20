import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { PHARMACIES } from '../data/mockData';
import type { RootStackParamList } from '../navigation/types';
import { theme } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyDetail'>;

export function PharmacyDetailScreen({ route, navigation }: Props) {
  const { pharmacyId, medicineQuery } = route.params;
  const pharmacy = PHARMACIES.find((p) => p.id === pharmacyId);

  if (!pharmacy) {
    return (
      <View style={styles.screen}>
        <Text style={styles.h1}>Pharmacy not found</Text>
      </View>
    );
  }

  const availability = pharmacy.availability.find(
    (a) => a.medicine.toLowerCase() === medicineQuery.trim().toLowerCase()
  );

  const statusLabel = availability
    ? availability.status === 'IN_STOCK'
      ? 'In Stock'
      : 'Out of Stock'
    : 'Unknown';

  const statusColor = availability
    ? availability.status === 'IN_STOCK'
      ? theme.colors.success
      : theme.colors.error
    : theme.colors.textSecondary;

  return (
    <View style={styles.screen}>
      <View style={styles.headerCard}>
        <Text style={styles.h1}>{pharmacy.name}</Text>
        <Text style={styles.sub}>{pharmacy.address}</Text>
        <Text style={styles.sub}>
          {pharmacy.distanceKm.toFixed(1)} km • ETA {pharmacy.etaMin} min
        </Text>
        <Text style={[styles.status, { color: statusColor }]}>{statusLabel}</Text>

        <View style={styles.row}>
          {pharmacy.verifiedPharmacy ? (
            <Text style={styles.trust}>Verified Pharmacy</Text>
          ) : (
            <Text style={styles.trustMuted}>Not verified</Text>
          )}
          {pharmacy.openNow ? (
            <Text style={styles.open}>Open now</Text>
          ) : (
            <Text style={styles.closed}>Closed</Text>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Availability details</Text>
        <Text style={styles.body}>Medicine: {medicineQuery}</Text>
        <Text style={styles.body}>Status: {statusLabel}</Text>
        <Text style={styles.body}>
          Confidence:{' '}
          {availability ? `${Math.round(availability.metadata.confidence * 100)}%` : '—'}
        </Text>
        <Text style={styles.body}>
          Source: {availability ? availability.metadata.source : '—'}
        </Text>
        <Text style={styles.body}>
          Last updated: {availability ? availability.metadata.lastUpdatedISO : '—'}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => pharmacy.phone && Linking.openURL(`tel:${pharmacy.phone}`)}
          style={[styles.btn, styles.btnMuted]}
        >
          <Text style={styles.btnMutedText}>Call</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => Linking.openURL('https://maps.google.com/?q=pharmacy')}
          style={[styles.btn, styles.btnPrimary]}
        >
          <Text style={styles.btnPrimaryText}>Navigate</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => navigation.navigate('Emergency', { medicineQuery })}
        style={styles.emergencyLink}
      >
        <Text style={styles.emergencyLinkText}>Go to Emergency Mode</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  headerCard: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    backgroundColor: '#FFFFFF',
  },
  h1: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  sub: {
    marginTop: 4,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  status: {
    marginTop: theme.spacing.md,
    fontWeight: '900',
  },
  row: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trust: {
    color: theme.colors.textPrimary,
    fontWeight: '900',
  },
  trustMuted: {
    color: theme.colors.textSecondary,
    fontWeight: '900',
  },
  open: {
    color: theme.colors.success,
    fontWeight: '900',
  },
  closed: {
    color: theme.colors.error,
    fontWeight: '900',
  },
  card: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '900',
    marginBottom: theme.spacing.sm,
  },
  body: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  btn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  btnMuted: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.border,
  },
  btnMutedText: {
    color: theme.colors.textPrimary,
    fontWeight: '900',
  },
  emergencyLink: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  emergencyLinkText: {
    color: theme.colors.primary,
    fontWeight: '900',
  },
});
