export type AvailabilityStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type AvailabilityMetadata = {
  lastUpdatedISO: string;
  source: 'USER' | 'PHARMACY' | 'SYSTEM';
  confidence: number; // 0..1
  verified: boolean;
};

export type PharmacyMedicineAvailability = {
  medicine: string;
  status: AvailabilityStatus;
  metadata: AvailabilityMetadata;

  // Real dataset fields (optional because mock data may omit them)
  stock?: number;
  price?: number;
  requiresPrescription?: boolean;
  medicineId?: string;
  batchNo?: string;
  lastRestocked?: string;
  reorderLevel?: number;
};

export type Pharmacy = {
  id: string;
  name: string;
  phone?: string;
  address: string;
  distanceKm: number;
  etaMin: number;
  openNow: boolean;
  is247: boolean;
  verifiedPharmacy: boolean;
  availability: PharmacyMedicineAvailability[];
};
