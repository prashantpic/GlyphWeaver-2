import { Router } from 'express';
// import authRoutes from '../auth/auth.routes';
// import leaderboardRoutes from '../leaderboard/leaderboard.routes';
// import iapRoutes from '../iap/iap.routes';
// import playerDataRoutes from '../player-data/player-data.routes';
// import proceduralLevelRoutes from '../procedural-level/procedural-level.routes';
// import rewardsRoutes from '../rewards/rewards.routes';
// import adminRoutes from '../admin/admin.routes';
// import analyticsRoutes from '../analytics/analytics.routes';

const router = Router();

// Mount feature-specific routers
// router.use('/auth', authRoutes);
// router.use('/leaderboard', leaderboardRoutes);
// router.use('/iap', iapRoutes);
// router.use('/player', playerDataRoutes); // Assuming '/player' for player data sync
// router.use('/levels/procedural', proceduralLevelRoutes); // Matching endpoint structure
// router.use('/rewards', rewardsRoutes);
// router.use('/admin', adminRoutes);
// router.use('/analytics', analyticsRoutes);

// Placeholder for ungenerated routes - remove or uncomment above when routes are available
router.get('/', (req, res) => {
  res.json({ message: 'Glyph Puzzle API Main Router. Other routes are pending.' });
});


export default router;