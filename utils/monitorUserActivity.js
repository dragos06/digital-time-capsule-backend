import pool from "../db/pool.js";

const SUSPICIOUS_THRESHOLD = 100; // e.g., 100 actions in the past day

export async function monitorUserActivity() {
  try {
    const result = await pool.query(`
      SELECT user_id, COUNT(*) as action_count
      FROM user_activity_log
      WHERE timestamp > NOW() - INTERVAL '1 day'
      GROUP BY user_id
      HAVING COUNT(*) > $1
    `, [SUSPICIOUS_THRESHOLD]);

    const suspiciousUsers = result.rows.map(row => row.user_id);

    // Replace previous monitored users
    await pool.query('TRUNCATE monitored_users RESTART IDENTITY');
    for (const userId of suspiciousUsers) {
      await pool.query('INSERT INTO monitored_users (user_id) VALUES ($1)', [userId]);
    }

    console.log('Monitored users updated');
  } catch (err) {
    console.error('Error in monitorUserActivity:', err);
  }
}