import cron from "node-cron";
import jwt from "jsonwebtoken";
import fs from "fs";
import User from "../models/User.js";

const publicKey = fs.readFileSync(process.cwd() + "/public.key", "utf8");

async function removeExpiredRefreshTokens() {
  const users = await User.find({ "refreshTokens.0": { $exists: true } });
  for (const user of users) {
    const validTokens = user.refreshTokens.filter(rt => {
      try {
        jwt.verify(rt.token, publicKey, { algorithms: ["RS256"] });
        return true;
      } catch (err) {
        return false;
      }
    });
    if (validTokens.length !== user.refreshTokens.length) {
      user.refreshTokens = validTokens;
      await user.save();
      console.log(`Cleaned expired refresh tokens for user: ${user.username}`);
    }
  }
}

cron.schedule("0 7 * * *", async () => {
  console.log("[CRON] Running expired refresh token cleanup at 7AM");
  await removeExpiredRefreshTokens();
});

export default removeExpiredRefreshTokens;
