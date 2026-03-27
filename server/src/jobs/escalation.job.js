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
        const result = await checkEscalation(post.createdAt, categoryWeight);

        if (result.should_escalate) {
          post.isEscalated = true;
          post.escalatedAt = new Date();
          post.escalatedTo = "Campus Administration";
          await post.save();

          await EscalationLog.create({
            postId: post._id,
            triggeredAt: new Date(),
            escalatedTo: "Campus Administration",
            previousStatus: post.status,
            reason: `Exceeded ${result.deadline_hours}h threshold (${result.hours_elapsed.toFixed(1)}h elapsed)`,
            notificationSent: false,
          });

          try {
            await sendEscalationEmail(process.env.ESCALATION_EMAIL, post);
            await EscalationLog.findOneAndUpdate({ postId: post._id }, { notificationSent: true });
          } catch (mailErr) {
            console.error("[Escalation Job] Email failed:", mailErr.message);
          }

          console.log(`[Escalation Job] Escalated post: ${post.title}`);
        }
      }
    } catch (err) {
      console.error("[Escalation Job] Error:", err.message);
    }
  });

  console.log("[Escalation Job] Scheduled (hourly)");
};

module.exports = startEscalationJob;
