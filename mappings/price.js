const mapStylesToSQLFormat = (data) => {
  return data.reduce((acc, current) => {
    const {
      id_developmentstyle,
      season,
      style,
      cost,
      price,
      msrp,
      modifiedby,
      modifiedon,
    } = current.Entity;

    acc.push(`(
    '${id_developmentstyle}',
    '${season}',
    '${style}',
    '${cost}',
    '${price}',
    '${msrp}',
    '${modifiedby}',
    CAST(LEFT('${modifiedon}',19) as datetime)
  )`);
    return acc;
  }, []);
};

module.exports = {
  mapStylesToSQLFormat,
};
