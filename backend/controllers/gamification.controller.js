import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";

// XP gap logic:
// L1->L2: 100XP
// L2->L3: 150XP
// L3->L4: 200XP
// Total XP for Level N = 25 * (N - 1) * (N + 2)
export const calculateLevel = (xp) => {
  return Math.floor((-1 + Math.sqrt(9 + 0.16 * xp)) / 2);
};

export const getXPForLevel = (level) => {
  return 25 * (level - 1) * (level + 2);
};

export const awardXP = async (userId, amount) => {
  try {
    const today = new Date().toISOString().substring(0, 10);
    
    // First, atomically update the ActivityLog
    const log = await ActivityLog.findOneAndUpdate(
      { user: userId, date: today },
      { $inc: { xpGained: amount, actions: 1 } },
      { upsert: true, new: true }
    );

    // Atomically increment XP on the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { xp: amount } },
      { new: true }
    );

    if (!updatedUser) return;

    let isNewDay = false;
    let needsSave = false;

    // Daily streak logic (only run if date changed)
    if (updatedUser.lastStudyDate !== today) {
      if (updatedUser.lastStudyDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().substring(0, 10);

        if (updatedUser.lastStudyDate === yesterdayStr) {
          updatedUser.currentStreak += 1;
        } else {
          updatedUser.currentStreak = 1; 
        }
      } else {
        updatedUser.currentStreak = 1;
      }
      updatedUser.lastStudyDate = today;
      isNewDay = true;
      needsSave = true;
    }

    if (updatedUser.currentStreak > updatedUser.longestStreak) {
      updatedUser.longestStreak = updatedUser.currentStreak;
      needsSave = true;
    }

    // Check if level changed
    const newLevel = calculateLevel(updatedUser.xp);
    if (newLevel > updatedUser.level) {
      updatedUser.level = newLevel;
      needsSave = true;
    }

    if (needsSave) {
      await updatedUser.save();
    }

    return { user: updatedUser, log, isNewDay };
  } catch (error) {
    console.error("Award XP Error:", error);
  }
};

export const getProgressStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("xp level currentStreak longestStreak lastStudyDate");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch last 30 days of activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateLimit = thirtyDaysAgo.toISOString().substring(0, 10);

    const activity = await ActivityLog.find({
      user: req.user.id,
      date: { $gte: dateLimit }
    }).sort({ date: 1 });

    // Calculate progression to next level using the updated formula
    const currentLevelXP = getXPForLevel(user.level);
    const nextLevelXP = getXPForLevel(user.level + 1);
    
    // Safety fallback just in case floating point weirdness happens
    const safeCurrentLevelXP = user.xp < currentLevelXP ? getXPForLevel(user.level - 1) : currentLevelXP;
    const safeNextLevelXP = user.xp < currentLevelXP ? currentLevelXP : nextLevelXP;

    const progressXP = user.xp - safeCurrentLevelXP;
    const requiredXP = safeNextLevelXP - safeCurrentLevelXP;

    res.status(200).json({
      stats: {
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastStudyDate: user.lastStudyDate,
        progress: {
          current: progressXP,
          target: requiredXP,
          percentage: (progressXP / requiredXP) * 100
        }
      },
      activity
    });
  } catch (error) {
    console.error("Progress Stats Error:", error);
    res.status(500).json({ message: "Failed to load progress stats" });
  }
};

export const manualAwardXP = async (req, res) => {
  try {
    const { xp, source } = req.body;
    if (!xp || xp <= 0) return res.status(400).json({ message: "Invalid XP amount" });
    
    const gamificationResult = await awardXP(req.user.id, xp);
    
    res.status(200).json({ 
      gamification: gamificationResult,
      message: `Awarded ${xp} XP for ${source || "Task"}`
    });
  } catch (err) {
    console.error("Manual Award XP Error:", err);
    res.status(500).json({ message: "Failed to award XP" });
  }
};
