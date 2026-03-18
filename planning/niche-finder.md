# Niche Finder — Finalized Spec

## Core Purpose
Find profitable YouTube niches, analyze competitors, identify outliers, and funnel users into Channel creation with auto-generated Styles.

## Features (ALL ship at launch — no phased tiers)

### Discovery & Data
1. Breakout channel database with persistent index
2. Multi-strategy crawler (seed queries, snowball, stats refresh)
3. Multi-key YouTube API rotation with quota tracking
4. Google Trends integration for trend velocity
5. Keyword difficulty scoring
6. Related niche suggestions (adjacent niches)

### Scoring & Analysis
7. Niche-level breakout detection (not just channel-level)
8. Composite scoring (demand, competition, growth, monetization, consistency, view velocity)
9. Outlier detection with Nx Viral Multiplier (inspired by Cila.app) — shows how much a video outperformed the channel's own average as a multiplier (e.g., "52x" means 52 times their average views). Makes cross-channel comparison meaningful regardless of channel size.
10. Outlier "Why It Worked" analysis (GPT-4o breaks down hook, title, thumbnail, topic)
11. Satisfaction-weighted scoring (YouTube's 2025 algorithm: watch time + satisfaction signals)
12. Niche saturation forecasting (project future competition levels)

### Content Intelligence
13. Thumbnail pattern analysis per niche (GPT-4o Vision)
14. Hook pattern library (extract what hooks work per niche)
15. Content calendar intelligence (optimal posting times/frequency per niche)
16. Traffic source profile per niche (search vs browse vs suggested)
17. Topic evolution timeline (how topics shift over time in a niche)

### Channel Analysis
18. Faceless channel detection (heuristic + MediaPipe on server)
19. Competitor upload schedule tracking
20. Revenue estimation (user-calibrated RPM + crowdsourced)
21. Time to monetization estimator (days to YPP eligibility)
22. Revenue stacking analysis (sponsorships, affiliates, products beyond AdSense)

### AI Features
23. GPT-4o semantic clustering (group channels by content approach)
24. AI niche recommendations with brand context
25. Niche pivot alerts (when your niche is declining, suggest pivots)
26. Knowledge graph content gap analysis
27. Audience persona clustering (who watches this niche)

### Advanced Signals
28. Reddit/social signal monitoring (r/NewTubers, niche subreddits)
29. Comment sentiment mining
30. Shorts vs Longform performance split

### Integration Points
31. "Create Channel From This" → Channel creation with auto Style generation
32. "Create Video From This" → Pre-fill project from outlier within existing Channel
33. Background weekly recommendations with push alerts

## Technical Details
- YouTube API quota: 3 keys = ~174 searches/day, 10 keys = ~600/day
- GPT-4o results cached per NICHE (not per user)
- MediaPipe runs on server (ECS Fargate/Lambda), not client
- DynamoDB with 3-4 GSIs + Lambda client-side filtering for complex queries
- Google Trends API is in alpha — need fallback strategy
- All data stored in DynamoDB on-demand (<$1/month at small scale)

## Competitors Researched
TubeGen.ai, vidIQ, TubeBuddy, TubeLab, NexLev, OutlierKit, Exploding Topics, Algrow, ChannelCrawler, FindAChannel, Niche Laboratory

## What We Do That Nobody Else Does
- Outlier "Why It Worked" breakdown
- Auto Style generation from reference channel
- Satisfaction-weighted scoring
- Niche-to-Channel creation pipeline
- Revenue stacking analysis
- Content gap knowledge graph
- Audience persona clustering
