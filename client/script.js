import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const input = document.querySelector('textarea[name="prompt"]');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typetext(element, text) {
  if (!text) {
    return;
  }

  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAI, value, uniqueId) {
  return `
    <div class="wrapper ${isAI && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img src="${isAI ? bot : user}" alt="${isAI ? 'bot' : 'user'}" />
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
  `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chat-stripe
  const prompt = data.get('prompt');
  chatContainer.innerHTML += chatStripe(false, prompt, generateUniqueId());
  form.reset();

  // bot's chat-stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, '', uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // Call the ChatGPT API and get the response
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt
    })
  })

  clearInterval(loadInterval);

  const result = await response.json();

  // Update the bot's chat-stripe with the generated text
  const generatedText = result.bot;
  clearInterval(loadInterval);
  typetext(messageDiv, generatedText);
};

form.addEventListener('submit', handleSubmit);

input.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});