CODE TO CONVERT ANTON HISTORICAL DATA EXCEL TO GRAPH DAILY CVI INDEX

const array = [
  ["7/7/2021 17:00",97.59845813  ],
  ["7/7/2021 18:00",97.54686345  ]
].map(item => {
  let date = item[0].split(" ")[0].split("/");
  const temp = date[0];
  date[0] = date[1]
  date[1] = temp;

  return [date.join('/'), item[1]]
})

const result = array.filter(item => {
  if(!tz[item[0]]) {
    tz[item[0]] = item[0]
    return true;
  }
  return false
}).map(item => [temp1.utc(item[0]), item[1]])