import pool from "../db/pool.js";

export async function getCapsules({
  search = "",
  sort = "asc",
  status = "All",
  offset = 0,
  limit = 9,
  userId
}) {
  offset = parseInt(offset);
  limit = parseInt(limit);

  let query = "SELECT * FROM time_capsules WHERE user_id = $1";
  let values = [userId];

  if (search) {
    values.push(`%${search.toLowerCase()}%`);
    query += ` AND LOWER(capsule_title) LIKE $${values.length}`;
  }

  if (status === "Locked" || status === "Unlocked") {
    values.push(status);
    query += ` AND capsule_status = $${values.length}`;
  }

  query += ` ORDER BY capsule_date ${sort === "desc" ? "DESC" : "ASC"} LIMIT $${
    values.length + 1
  } OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);

  const formattedRows = result.rows.map((row) => ({
    ...row,
    capsule_date: new Date(row.capsule_date).toISOString().split("T")[0],
  }));

  const countResult = await pool.query("SELECT COUNT(*) FROM time_capsules");
  const total = parseInt(countResult.rows[0].count);

  return {
    capsules: formattedRows,
    hasMore: offset + limit < total,
  };
}

export async function getCapsuleById(id, userId) {
  const result = await pool.query(
    "SELECT * FROM time_capsules WHERE capsule_id = $1 and user_id = $2",
    [id, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const [row] = result.rows;

  return {
    ...row,
    capsule_date: new Date(row.capsule_date).toISOString().split("T")[0],
  };
}

export async function createCapsule({ title, date, status, description, userId }) {
  const result = await pool.query(
    `INSERT INTO time_capsules (capsule_title, capsule_date, capsule_status, capsule_description, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, date, status, description, userId]
  );
  return result.rows[0];
}

export async function updateCapsuleById(
  id,
  { title, date, status, description },
  userId
) {
  const result = await pool.query(
    `UPDATE time_capsules
       SET capsule_title = $1, capsule_date = $2, capsule_status = $3, capsule_description = $4
       WHERE capsule_id = $5 AND user_id = $6 RETURNING *`,
    [title, date, status, description, id, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const [updatedRow] = result.rows;

  return {
    ...updatedRow,
    capsule_date: new Date(updatedRow.capsule_date).toISOString().split("T")[0],
  };
}

export async function deleteCapsuleById(id, userId) {
  const result = await pool.query(
    "DELETE FROM time_capsules WHERE capsule_id = $1 and user_id = $2 RETURNING *",
    [id, userId]
  );

  return result.rows.length > 0;
}

export async function generateRandomCapsules(count) {
  const statuses = ["Locked", "Unlocked"];
  let generatedCapsules = [];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const date = new Date(
      status === "Locked"
        ? new Date().getTime() + Math.random() * 1000000000
        : new Date().getTime() - Math.random() * 1000000000
    ).toISOString().split("T")[0];
    const title = `Capsule ${Math.random().toString(36).substring(7)}`;
    const description = `Description of capsule ${Math.random().toString(36).substring(7)}`;

    const newCapsule = {
      title,
      date,
      status,
      description,
    };

    generatedCapsules.push(newCapsule);
  }

  return generatedCapsules;
}