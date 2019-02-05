function formatTimeSeries(rows) {
  var dates = [];
  var values = [];
  var count = 0;
  rows.map((row) => {
    dates.push(row.createdAt);
    count += row.count;
    values.push(count);
    return true;
  });

  return {
    dates: dates,
    values: values
  };
}

module.exports = formatTimeSeries;