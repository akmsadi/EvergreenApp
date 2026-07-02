import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("evergreen.db");

export default db;