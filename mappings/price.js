const mapStylesToSQLFormat = (data) => {
  const {
    id_developmentstyle,
    season,
    style,
    cost,
    price,
    msrp,
    modifiedby,
    modifiedon,
  } = data;

  return `(
    '${id_developmentstyle}',
    '${season}',
    '${style}',
    '${cost}',
    '${price}',
    '${msrp}',
    '${modifiedby}',
    CAST(LEFT('${modifiedon}',19) as datetime)
  )`;
};

module.exports = {
  mapStylesToSQLFormat,
};
