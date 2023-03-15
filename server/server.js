import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Greetings and salutations, dear traveler! I am TogeeVision, your wise guide to the fascinating world of NFTs.',
  });
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.4,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.4,
      presence_penalty: .5,
    });

    let nftResponse = response.data.choices[0].text;
    nftResponse = nftResponse.replace('I', 'As a seer of the future, I');
    nftResponse = nftResponse.replace('you', 'all who seek knowledge in this realm, no matter how unenlightened they may be. ');
    nftResponse = nftResponse.replace('.', ' - . The possibilities are limitless and unknowable!');
    nftResponse += " Attention to the here and now. ";

    res.status(200).send({
      bot: nftResponse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

// Start the server
app.listen(process.env.PORT || 5000, () => {
  console.log(`By the power of the Almighty, the server is running on port ${process.env.PORT || 5000}`);
});
