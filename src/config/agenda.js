module.exports = {
  // TODO: change dates
  registrationStart: new Date("2021-11-14 19:30:00"), // Registration starts for skills++
  registrationEnd: new Date("2022-11-20 00:00:00"), // Registration stops for skills++
  eventStart: new Date("2022-11-14 00:00:00"), // Skills++ event starts
  weekStart: new Date("2022-11-21 00:00:00"), // Week 1 starts for skills++
  weekInterval: 7 * 24 * 60 * 60 * 1000,
  maxWeekNos: 4,
  extraTime: 2 * 24 * 60 * 60 * 1000,
  marksTable: [
    {
      time: 7 * 24 * 60 * 60 * 1000,
      mark: 100,
    },
    {
      time: 8 * 24 * 60 * 60 * 1000,
      mark: 70,
    },
    {
      time: 9 * 24 * 60 * 60 * 1000,
      mark: 40,
    },
  ],
  delayedMarks: -30,
  unapprovedMarks: 0,
  oneDay: 24 * 60 * 60 * 1000,
};

// 9-15 16-22 23-29 30-6