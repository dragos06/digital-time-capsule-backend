import pool from "../db/pool.js"

const logUserAction = async (userId, action) => {
  await pool.query(
    "INSERT INTO user_activity_log (user_id, action) VALUES ($1, $2)",
    [userId, action]
  );
};

export default logUserAction;
