export function isPrescriptionRequired(requiresPrescription?: boolean) {
	return requiresPrescription === true;
}

export function shouldBlockOrder(requiresPrescription?: boolean) {
	return isPrescriptionRequired(requiresPrescription);
}
