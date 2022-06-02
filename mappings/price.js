const mapStylesToSQLFormat = (data) => {
  return data.reduce((acc, current) => {
    const {
      id_developmentstyle,
      season,
      style,
      transactiontotalcost,
      price,
      msrp,
    } = current;

    acc.push(`(
    '${id_developmentstyle}',
    '${season}',
    '${style}',
    '${transactiontotalcost}',
    '${price}',
    '${msrp}'
  )`);
    return acc;
  }, []);
};

module.exports = {
  mapStylesToSQLFormat,
};
