var Sequelize = require("sequelize");

const sequelize = new Sequelize("neondb", "neondb_owner", "npg_FExf5Idh4UCy", {
  host: "ep-wild-math-ab6zzww8-pooler.eu-west-2.aws.neon.tech",
  port: 5432,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

module.exports = sequelize;