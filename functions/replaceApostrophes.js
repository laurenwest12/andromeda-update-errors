const replaceApostrophes = (obj) => {
	Object.keys(obj).map((key) => {
		if (typeof obj[key] === 'string') {
			obj[key] = obj[key].replace(/'/g, "''");
		}
	});
};

module.exports = {
	replaceApostrophes,
};
