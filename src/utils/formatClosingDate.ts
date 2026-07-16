export const formatClosingDate = (closingDate: Date): string => {
	if (Number.isNaN(closingDate.getTime())) {
		return String(closingDate);
	}

	const [year, month, day] = closingDate.toISOString().slice(0, 10).split('-');
	return `${day}-${month}-${year}`;
};
