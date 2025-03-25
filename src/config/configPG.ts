import {config} from "dotenv"
import  Sequelize  from "sequelize";
import "colors";
config({path:`.env.dev`})
const sequelize = new Sequelize.Sequelize(
  process.env.POSTGRES_DATABASE!,
  process.env.POSTGRES_USER!,
  process.env.POSTGRES_PASSWORD,
  {
    dialect: "postgres",
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT!,
    timezone: "+05:30",
    query: { raw: true },
    define: {
      schema: `${process.env.DEFAULT_SCHEMA}`,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      underscored: true,
      freezeTableName: true,
      // don't add the timestamp attributes (updatedAt, createdAt)
      timestamps: false,
      // If don't want createdAt
      createdAt: false,
      // If don't want updatedAt
      updatedAt: false,
    },
    pool: {
      min: 10,
      max: 50,
      acquire: 30000,
      idle: 10000,
    },
    logQueryParameters: process.env.NODE_ENV === "development",
    logging: true,
    benchmark: true,
  }
);

  sequelize.authenticate().then(()=>{
    console.log("POSTGRES database authenticated".bgMagenta.underline)
  });

  sequelize.authenticate();
 const POSTGRESDB={
    // GoalDefiniition:GoalDefiniitionModel(sequelize),
    // Breakdown:BreakdownModel(sequelize),
    // KPI:KPIModel(sequelize),
    // Domains:DomainModel(sequelize),
    sequelize,
    Sequelize
 }
 export default POSTGRESDB