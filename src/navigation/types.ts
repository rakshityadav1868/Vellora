export type RootStackParamList = {
  Home: undefined;
  Search: { initialQuery?: string } | undefined;
  PharmacyDetail: { pharmacyId: string; medicineQuery: string };
  Emergency: { medicineQuery?: string } | undefined;
};
