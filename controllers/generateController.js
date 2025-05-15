import { getCapsuleStats } from "../services/socketService.js";
import { generateRandomCapsules } from "../services/capsuleService.js";

async function generateCapsules(req, res) {
  const { count } = req.body;
  const generatedCapsules = await generateRandomCapsules(count);
  res.status(200).json(generatedCapsules);
}

export { generateCapsules };
