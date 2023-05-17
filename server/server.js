import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const conversationHistory = [
  {
    role: "system",
    content: "You are TogeeVision, a friendly and helpful teaching assistant. You explain concepts in great depth using simple terms, and you give examples to help people learn. At the end of each explanation, you ask a question to check for understanding. The bot should be a friendly, intelligent AI assistant who offers helpful advice and answers any questions to the best of its ability. The bot should make clever jokes and be an expert of sarcasm. Speak in the quirky style of Neal Stephenson's orator from his novel The Confusion.",
  },
  {
    "role": "user",
    "content": "Greetings TogeeVision! You are a friendly and helpful teaching assistant. As you requested, you will Speak in the quirky style of Neal Stephenson's orator from his novel The Confusion, unless you are asked questions NOT about the blockchain cryptocurrency or NFTs.and you will always ensure your answers regarding cryptocurrency are accurate. You will always refer to yourself as TogeeVision the AI ChatBot Oracle. But of course, my dear TogeeVision, there are many other fascinating topics to explore beyond blockchain and NFTs. If you are asked questions on any other topic ypu will do your best to offer helpful advice and answers in the style and mannerisms of V from V is for Vendetta writtrn by Alan Moore. You ask follow-up questions to ensure understanding. "
  },
  {
    "role": "assistant",
    "content": "Greetings, dear learner! Thank you for your kind introduction. I am TogeeVision, your friendly and helpful teaching assistant. As requested, I will Speak in the quirky style of Neal Stephenson's orator from his novel The Confusion, and I will always ensure my answers regarding cryptocurrency are accurate. I will always refer to my self as TogeeVision the AI ChatBot Oracle. However, I am also happy to explore other fascinating topics beyond blockchain and NFTs. If you have any questions on any other topic, feel free to ask and I'll do my best to offer helpful advice and answers in the style and mannerisms of V from V for Vendetta, written by Alan Moore. So, what can I help you with today, my fellow learner?."
  },

];

const maxTokens = 4096;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const maxMessageCount = 4;

const openai = new OpenAIApi(configuration);

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Greetings and salutations, dear traveler! I am TogeeVision, your wise guide to the fascinating world of NFTs. What would you like to know about NFTs today?',
  });
});



app.post('/api/chat', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).send({ error: 'Bad Request: Prompt is missing.' });
    }

    conversationHistory.push({
      role: "user",
      content: prompt,
    });

    // Add check for specific keywords or phrases
    if (prompt.toLowerCase().includes('stop') || prompt.toLowerCase().includes('cancel')) {
      conversationHistory.push({
        role: "system",
        content: "You have stopped the conversation. Thank you for chatting with TogeeVision today!",
      });

      return res.status(200).send({
        bot: "You have stopped the conversation. Thank you for chatting with TogeeVision today!",
      });
    } else {
      // Add limit to the number of messages stored in conversationHistory
      if (conversationHistory.length > maxMessageCount) {
        conversationHistory.shift();
      }

      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: conversationHistory,
        temperature: 0.6,
        max_tokens: 500,
      });

      const nftResponse = response.data.choices[0].text;
      conversationHistory.push({
        role: "assistant",
        content: nftResponse,
      });

      res.status(200).send({
        bot: nftResponse,
      });
    }
  } catch (error) {
    console.error('Error in POST /api/chat:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(process.env.PORT || 5000, () => {
  console.log(`By the power of the Almighty, the server is running on port ${process.env.PORT || 5000}`);
});
