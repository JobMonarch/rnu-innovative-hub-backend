import express from "express";

const router = express.Router();

// Use ES module imports for AI logic
import IntentDetector from "../../../ai-module/src/intent-recognition/intentDetector.js";
import RecommendationEngine from "../../../ai-module/src/recommendation-engine/recommendationEngine.js";
import MilestoneLogic from "../../../ai-module/src/gamification/milestoneLogic.js";

// POST /api/ai/chat
router.post("/chat", (req, res) => {
  const { message, userData, conversation = [] } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  console.log('📨 Chat request received:', message);
  console.log('👤 userData:', JSON.stringify(userData, null, 2));

  const intentDetector = new IntentDetector();
  const recommendationEngine = new RecommendationEngine();
  const milestoneLogic = new MilestoneLogic();

  // Try to infer context from previous messages
  let contextIntent = null;
  if (conversation.length > 1) {
    // Find the last user message before this one
    for (let i = conversation.length - 2; i >= 0; i--) {
      if (conversation[i].from === "user") {
        contextIntent = intentDetector.detectIntent(conversation[i].text);
        break;
      }
    }
  }

  let intent = intentDetector.detectIntent(message);
  let entities = intentDetector.extractEntities(message);
  const recommendations = userData ? recommendationEngine.generateRecommendations(userData) : [];
  const milestones = userData ? milestoneLogic.checkMilestones(userData) : [];

  console.log('💡 Recommendations generated:', recommendations);
  console.log('🏆 Milestones generated:', milestones);

  // If the current message is a follow-up (e.g., 'what are those?'), use context
  if ((/what (are|is) (those|that|these)/i.test(message) || /more info|details|explain/i.test(message)) && contextIntent) {
    intent = contextIntent;
    entities = intentDetector.extractEntities(conversation[conversation.length - 2].text);
  }

  // Compose a user-friendly reply
  let replyText = "";
  switch (intent) {
    case "GREETING":
      replyText = "Hi! How can I help you?";
      break;
    case "LIST_CERTIFICATES":
      replyText = `You have ${userData?.certifications?.length || 0} certificates.`;
      if (userData?.certifications?.length > 0) {
        replyText += " Certificates: " + userData.certifications.map(c => c.title || "Untitled").join(", ");
      }
      break;
    case "LIST_PROJECTS":
      replyText = `You have ${userData?.projects?.length || 0} projects.`;
      if (userData?.projects?.length > 0) {
        replyText += " Projects: " + userData.projects.map(p => p.title || "Untitled").join(", ");
      }
      break;
    case "LIST_PUBLICATIONS":
      replyText = `You have ${userData?.publications?.length || 0} publications.`;
      if (userData?.publications?.length > 0) {
        replyText += " Publications: " + userData.publications.map(p => p.title || "Untitled").join(", ");
      }
      break;
    case "COUNT_ACHIEVEMENTS":
      const total = (userData?.certifications?.length || 0) + (userData?.projects?.length || 0) + (userData?.publications?.length || 0) + (userData?.university_issues?.length || 0);
      replyText = `You have a total of ${total} achievements.`;
      break;
    case "LATEST_ACHIEVEMENT":
      replyText = "Feature coming soon: latest achievement summary.";
      break;
    case "HELP":
      replyText = "You can ask me about your certificates, projects, publications, or achievements!";
      break;
    case "ANY_ACHIEVEMENT":
      const totalAch = (userData?.certifications?.length || 0) + (userData?.projects?.length || 0) + (userData?.publications?.length || 0) + (userData?.university_issues?.length || 0);
      replyText = `You have ${totalAch} achievements: ${userData?.certifications?.length || 0} certificates, ${userData?.projects?.length || 0} projects, ${userData?.publications?.length || 0} publications, and ${userData?.university_issues?.length || 0} university issues.`;
      break;
    default:
      replyText = "I'm your AI assistant. You can ask about your academic achievements, certificates, projects, or milestones.";
  }

  if (recommendations.length > 0) {
    replyText += "\n\nRecommendations:\n" + recommendations.map(r => `- ${r.message}`).join("\n");
  }
  if (milestones.length > 0) {
    replyText += "\n\nUnlocked Milestones:\n" + milestones.map(m => `- ${m}`).join("\n");
  }

  res.json({
    replyText,
    intent,
    entities,
    recommendations,
    milestones
  });
});

export default router;
