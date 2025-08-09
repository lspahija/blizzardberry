# Interactive AI Agent Demo - Recording Guide

## Overview
Your demo page is now ready at `http://localhost:3000/demo`. This page shows a **realistic business dashboard** with an **AI agent that actually performs tasks** when users ask for them.

## Demo Features

### 🎯 Real Product Demo
This is NOT a marketing video - it's an actual product demonstration showing:

1. **Business Dashboard** - Realistic revenue data, metrics, and activity feed
2. **AI Chat Interface** - Side-by-side chat widget that responds to user requests
3. **Live Data Updates** - Dashboard elements highlight and update based on AI responses
4. **Task Execution** - AI agent performs actual tasks like creating support tickets

### 🤖 Interactive Scenarios
The demo automatically cycles through 3 realistic scenarios:

**Scenario 1: Data Analysis**
- User: "Show me revenue numbers for North America"
- AI: Highlights North America section, provides detailed breakdown
- Dashboard: North America card scales up and highlights in green

**Scenario 2: Cross-Regional Query** 
- User: "Now show me how many orders came from Europe"
- AI: Switches focus to Europe, provides order count and AOV
- Dashboard: Europe card highlights in blue, North America resets

**Scenario 3: Task Execution**
- User: "Create a customer support ticket for the Johnson account - they're having billing issues"
- AI: Creates actual support ticket with details, assigns to team member
- Dashboard: Shows task completion with ticket number and assignment

### ⚡ Key Demo Highlights
- **Realistic typing animation** - Users see messages being typed character by character
- **Visual dashboard updates** - Cards scale, highlight, and change colors based on AI responses
- **Professional chat interface** - Looks like a real business tool, not a toy
- **Meaningful interactions** - Each request demonstrates real business value

## Recording Instructions

### 1. Prepare Your Setup
- Open browser in full-screen mode at `http://localhost:3000/demo`
- Demo automatically starts after 1 second
- Each complete cycle takes ~30 seconds
- Auto-restarts with 4-second pause between cycles

### 2. What You'll See in the Demo

**Timeline:**
- **0-3s:** Dashboard loads with business data
- **3-8s:** User types "Show me revenue numbers for North America"
- **8-12s:** AI responds and highlights North America data (green)
- **12-17s:** User types "Now show me how many orders came from Europe"  
- **17-22s:** AI responds and highlights Europe data (blue)
- **22-27s:** User types support ticket request
- **27-32s:** AI creates ticket and shows completion
- **32-36s:** Brief pause before auto-restart

### 3. Recording Tools & Settings

**Recommended Tools:**
- **OBS Studio** (free, professional) - Best choice
- **QuickTime Player** (macOS) - Simple and reliable
- **Loom** (paid) - Great for sharing/editing

**Settings:**
- **Resolution:** 1920x1080 minimum (4K if possible)
- **Frame Rate:** 60fps for smooth animations
- **Audio:** Silent (add voiceover later) or screen audio
- **Duration:** 30-35 seconds per cycle

### 4. Recording Strategy

**Option A: Single Cycle (30s)**
- Perfect for social media and quick demos
- Shows all 3 scenarios in one smooth sequence
- Most engaging and attention-grabbing

**Option B: Multiple Cycles (60-90s)**
- Shows consistency and reliability
- Good for detailed product presentations
- Allows viewers to catch details they missed

### 5. Post-Production Tips

**Essential Edits:**
- Crop to remove browser UI if visible
- Add subtle zoom-ins during key moments (data highlighting)
- Consider picture-in-picture for the chat interaction

**Audio Options:**
- **Voiceover:** Explain what's happening ("Here the user asks for North America data...")
- **Text Overlays:** Highlight key benefits ("Instant data analysis", "Task automation")
- **Music:** Subtle, professional background music

**Export Settings:**
- MP4, H.264 codec
- 1080p or 4K resolution
- 60fps to match recording

### 6. Demo Controls & Features

**Manual Control:**
- Click "Restart Demo" (top-right) to restart anytime
- Demo auto-loops continuously for easy recording
- Consistent timing for predictable recording

**Visual Indicators:**
- Green highlighting for North America data
- Blue highlighting for Europe data
- Typing indicators show AI is "thinking"
- Success checkmarks for completed tasks

## What Makes This Demo Powerful

✅ **Shows real AI agent behavior** - Not just conversation, but actual task execution  
✅ **Visual feedback** - Dashboard updates show the AI is connected to real systems  
✅ **Business context** - Revenue analysis and support tickets are real business needs  
✅ **Professional UI** - Looks like enterprise software, not a toy chatbot  
✅ **Multiple use cases** - Data analysis + task execution in one demo  

## File Locations
- Demo Page: `/src/app/(frontend)/(main)/demo/page.tsx`
- This Guide: `/DEMO_RECORDING_GUIDE.md`

## Ready to Record!
Navigate to `http://localhost:3000/demo` and watch the magic happen. The demo shows exactly what you described - a user asking for something and the agent actually doing it with visual feedback.