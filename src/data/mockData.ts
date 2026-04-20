import { type Pharmacy } from '../types/domain';

const nowMinusMinutes = (min: number) => new Date(Date.now() - min * 60 * 1000).toISOString();

export const POPULAR_MEDICINES = [
	'Paracetamol',
	'Ibuprofen',
	'Amoxicillin',
	'Cetirizine',
	'ORS',
	'Insulin',
	'Inhaler (Salbutamol)',
] as const;

export const PHARMACIES: Pharmacy[] = [
	{
		id: 'ph_01',
		name: 'CityCare Pharmacy',
		phone: '+1-555-0101',
		address: '12 Market St',
		distanceKm: 1.2,
		etaMin: 6,
		openNow: true,
		is247: true,
		verifiedPharmacy: true,
		availability: [
			{
				medicine: 'Paracetamol',
				status: 'IN_STOCK',
				metadata: {
					lastUpdatedISO: nowMinusMinutes(8),
					source: 'PHARMACY',
					confidence: 0.95,
					verified: true,
				},
			},
			{
				medicine: 'Ibuprofen',
				status: 'IN_STOCK',
				metadata: {
					lastUpdatedISO: nowMinusMinutes(25),
					source: 'SYSTEM',
					confidence: 0.82,
					verified: false,
				},
			},
		],
	},
	{
		id: 'ph_02',
		name: 'HealthHub Medicals',
		phone: '+1-555-0102',
		address: '8 River Rd',
		distanceKm: 2.6,
		etaMin: 10,
		openNow: true,
		is247: false,
		verifiedPharmacy: false,
		availability: [
			{
				medicine: 'Paracetamol',
				status: 'OUT_OF_STOCK',
				metadata: {
					lastUpdatedISO: nowMinusMinutes(15),
					source: 'USER',
					confidence: 0.7,
					verified: false,
				},
			},
			{
				medicine: 'Cetirizine',
				status: 'IN_STOCK',
				metadata: {
					lastUpdatedISO: nowMinusMinutes(40),
					source: 'USER',
					confidence: 0.62,
					verified: false,
				},
			},
		],
	},
	{
		id: 'ph_03',
		name: 'NightOwl Pharmacy',
		phone: '+1-555-0103',
		address: '99 Sunset Ave',
		distanceKm: 0.9,
		etaMin: 8,
		openNow: false,
		is247: true,
		verifiedPharmacy: true,
		availability: [
			{
				medicine: 'Insulin',
				status: 'IN_STOCK',
				metadata: {
					lastUpdatedISO: nowMinusMinutes(55),
					source: 'PHARMACY',
					confidence: 0.9,
					verified: true,
				},
			},
			{
				medicine: 'Paracetamol',
				status: 'IN_STOCK',
				metadata: {
					lastUpdatedISO: nowMinusMinutes(70),
					source: 'SYSTEM',
					confidence: 0.58,
					verified: false,
				},
			},
		],
	},
	{
		id: 'ph_04',
		name: 'RapidRelief Chemist',
		phone: '+1-555-0104',
		address: '5 Central Plaza',
		distanceKm: 3.1,
		etaMin: 12,
		openNow: true,
		is247: false,
		verifiedPharmacy: true,
		availability: [
			{
				medicine: 'Ibuprofen',
				status: 'OUT_OF_STOCK',
				metadata: {
					lastUpdatedISO: nowMinusMinutes(5),
					source: 'PHARMACY',
					confidence: 0.96,
					verified: true,
				},
			},
			{
				medicine: 'Paracetamol',
				status: 'IN_STOCK',
				metadata: {
					lastUpdatedISO: nowMinusMinutes(4),
					source: 'PHARMACY',
					confidence: 0.98,
					verified: true,
				},
			},
		],
	},
];

