import express from "express";

const router = express.Router();

// In-memory storage
const achievements = [];

router.get("/:email/achievements", (req, res) => {
  const { email } = req.params;

  const userAchievements = achievements
    .filter(a => a.owner === email)
    .map(({ owner, ...rest }) => rest);

  res.set("Cache-Control", "no-store"); // 🔥 important
  res.json(userAchievements);
});


router.post("/:email/achievements", (req, res) => {
  const { email } = req.params;
  const { category, title, year, description, link } = req.body;
  const normalizedCategory = category?.toLowerCase();

  const achievement = {
    id: Date.now().toString(),
    category: normalizedCategory,
    title,
    year,
    description,
    link,
    createdAt: new Date()
  };

  achievements.push({
    ...achievement,
    owner: email
  });

  res.set("Cache-Control", "no-store"); // 🔥 important
  res.status(201).json(achievement);
});

export default router;
