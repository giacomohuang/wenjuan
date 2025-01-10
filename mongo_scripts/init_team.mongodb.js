const team = [
  {
    name: "团队1",
    description: "团队1描述",
    isDeleted: false,
  },
];

const database = "mpadmin";
use(database);

db.teams.deleteMany({});
db.teams.insertMany(team);
