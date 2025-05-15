import { getCapsules, getCapsuleById, createCapsule, updateCapsuleById, deleteCapsuleById } from "../services/capsuleService.js";
import logUserAction from "../middlewares/logUserAction.js";

export const getCapsulesController = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await getCapsules({...req.query, userId});
    res.json(data);
    //await logUserAction(userId, "FETCH_CAPSULES");
  } catch (err) {
    console.error("Error fetching capsules: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCapsuleByIdController = async (req, res) => {
  try {
    const userId = req.user.id;
    const capsule = await getCapsuleById(req.params.id, userId);

    if (!capsule) {
      return res.status(404).json({ error: "Capsule not found" });
    }

    res.json(capsule);
    await logUserAction(userId, "FETCH_CAPSULE_BY_ID");
  } catch (err) {
    console.error("Error fetching capsule:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createCapsuleController = async (req, res) => {
  try {
    const userId = req.user.id;
    const newCapsule = await createCapsule({...req.body, userId});
    res.status(201).json(newCapsule);
    await logUserAction(userId, "CREATE_CAPSULES");
  } catch (err) {
    console.error("Error inserting capsule:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCapsuleController = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedCapsule = await updateCapsuleById(req.params.id, req.body, userId);

    if (!updatedCapsule) {
      return res.status(404).json({ error: "Capsule not found" });
    }

    res.json(updatedCapsule);
    await logUserAction(userId, "UPDATE_CAPSULE");
  } catch (err) {
    console.error("Error updating capsule:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteCapsuleController = async (req, res) => {
  try {
    const userId = req.user.id;
    const wasDeleted = await deleteCapsuleById(req.params.id, userId);

    if (!wasDeleted) {
      return res.status(404).json({ error: "Capsule not found" });
    }

    res.json({ message: "Capsule deleted successfully" });
    await logUserAction(userId, "DELETE_CAPSULE");
  } catch (err) {
    console.error("Error deleting capsule:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
