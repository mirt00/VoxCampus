const cron = require("node-cron");
const Post = require("../models/Post.model");
const EscalationLog = require("../models/EscalationLog.model");
const { checkEscalation } = require("../services/python.service");
const { sendEscalationEmail } = require("../services/mail.service");

const startEscalationJob = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("[Escalation Job] Running...");
    try {
      const posts = await Post.find({ status: "pending", isEscalated: false }).populate("category");

      for (const post of posts) {
        const categoryWeight = post.category?.weight || 1.0;

        // Try algo-service, fall back to local calculation if it's down
        let shouldEscalate = false;
        let deadlineHours = 48 * categoryWeight;
        let hoursElapsed = (Date.now() - new Date(post.createdAt).getTime()) / 3600000;

        try {
          const result = await checkEscalation(post.createdAt, categoryWeight);
          shouldEscalate = result.should_escalate;
          deadlineHours = result.deadline_hours;
          hoursElapsed = result.hours_elapsed;
        } catch {
          // algo-service unavailable — use local fallback
          shouldEscalate = hoursElapsed >= deadlineHours;
        }

        if (shouldEscalate) {
          post.isEscalated = true;
          post.escalatedAt = new Date();
          post.escalatedTo = "Campus Administration";
          await post.save();

          await EscalationLog.create({
            postId: post._id,
            triggeredAt: new Date(),
            escalatedTo: "Campus Administration",
            previousStatus: post.status,
            reason: `Exceeded ${deadlineHours}h threshold (${hoursElapsed.toFixed(1)}h elapsed)`,
            notificationSent: false,
          });

          try {
            await sendEscalationEmail(process.env.ESCALATION_EMAIL, post);
            await EscalationLog.findOneAndUpdate({ postId: post._id }, { notificationSent: true });
          } catch (mailErr) {
            console.error("[Escalation Job] Email failed:", mailErr.message);
          }

          console.log(`[Escalation Job] Escalated: ${post.title}`);
        }
      }
    } catch (err) {
      console.error("[Escalation Job] Error:", err.message);
    }
  });

  console.log("[Escalation Job] Scheduled (hourly)");
};

module.exports = startEscalationJob;
