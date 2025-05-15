function validateCapsule(req, res, next) {
  const { title, date, status, description } = req.body;

  if (!title || !date || !status || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!["Locked", "Unlocked"].includes(status)) {
    return res
      .status(400)
      .json({ error: "Invalid status. Must be 'Locked' or 'Unlocked'." });
  }

  if (status === "Unlocked" && new Date(date) > new Date()) {
    return res.status(400).json({
      error: "Invalid status. Must be 'Locked' if date is in the future.",
    });
  }

  if (status === "Locked" && new Date(date) <= new Date()) {
    return res.status(400).json({
      error: "Invalid status. Must be 'Unlocked' if date is in the past.",
    });
  }

  if (
    isNaN(Date.parse(date)) ||
    new Date(date).toISOString().split("T")[0] !== date
  ) {
    return res.status(400).json({ error: "Invalid date format." });
  }

  next();
}

export default validateCapsule;
