# Alexa Skill Setup for LAIF

## Prerequisites
- Amazon Developer account (https://developer.amazon.com)
- LAIF server running and publicly accessible

## Step 1: Create the Skill
1. Go to https://developer.amazon.com/alexa/console/ask
2. Click **"Create Skill"**
3. Skill name: **LAIF**
4. Primary locale: **English (US)**
5. Choose a model: **Custom**
6. Choose a method to host: **Provision your own**
7. Click **Create Skill** → choose **Start from Scratch**

## Step 2: Set Up Interaction Model
1. In the left menu, click **"JSON Editor"** (under Interaction Model)
2. Paste the contents of `src/lib/alexa/interactionModel.json`
3. Click **"Save Model"**
4. Click **"Build Model"** (takes ~30 seconds)

## Step 3: Configure Endpoint
1. Click **"Endpoint"** in the left menu
2. Select **"HTTPS"**
3. Default Region URL: `https://your-domain.com/api/alexa`
   - For local dev, use ngrok (see below)
4. SSL Certificate: **"My development endpoint has a certificate from a trusted certificate authority"**
5. Click **"Save Endpoints"**

## Step 4: Test
1. Click the **"Test"** tab at the top
2. Change dropdown to **"Development"**
3. Type or say: `ask laif for my daily briefing`

## Local Development with ngrok

```bash
# Terminal 1: Run LAIF
npm run dev

# Terminal 2: Expose to internet
npx ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok-free.app)
# Paste into Alexa Console → Endpoint → Default Region:
# https://abc123.ngrok-free.app/api/alexa
```

## Available Voice Commands

### Tasks
- "Alexa, ask LAIF to **add a task called** Buy groceries"
- "Alexa, ask LAIF **what's on my today list**"
- "Alexa, ask LAIF **what's in my inbox**"
- "Alexa, ask LAIF to **mark** Buy groceries **as done**"
- "Alexa, ask LAIF **what's overdue**"
- "Alexa, ask LAIF to **set** Buy groceries **to high priority**"

### Daily Briefing
- "Alexa, ask LAIF for my **daily briefing**"

### Habits
- "Alexa, ask LAIF to **log my** exercise"
- "Alexa, ask LAIF **what's my** reading **streak**"

### Calendar
- "Alexa, ask LAIF **what's on my calendar**"

### Workflows
- "Alexa, ask LAIF **what's in my** Content Creation **board**"
- "Alexa, ask LAIF to **move** Blog Post **to** Review"

## Troubleshooting

### "There was a problem with the requested skill's response"
- Check that your server is running and accessible
- Check the ngrok URL is correct in the Alexa Console
- Look at the server logs for errors

### Skill not responding
- Make sure the interaction model is built (Build Model button)
- Make sure testing is enabled (Test tab → Development)
- Try the Alexa simulator in the console before using a real device

## Testing via curl

```bash
curl -X POST http://localhost:3000/api/alexa \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.0",
    "request": {
      "type": "IntentRequest",
      "intent": {
        "name": "DailyBriefingIntent",
        "slots": {}
      }
    }
  }'
```
