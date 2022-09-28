module.exports = {
  // TODO: change dates
  registrationStart: new Date("2021-09-25 19:30:00"), // Registration starts for skills++
  registrationEnd: new Date("2022-09-29 00:00:00"), // Registration stops for skills++
  eventStart: new Date("2022-09-27 00:00:00"), // Skills++ event starts
  weekStart: new Date("2022-09-25 00:00:00"), // Week 1 starts for skills++
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
