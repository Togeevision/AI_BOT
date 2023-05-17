import bot from './assets/bot.svg';
import user from './assets/user.svg';



const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const input = document.querySelector('textarea[name="prompt"]');

let loadInterval;

// Counter for user requests
let userRequests = 0;

// Add this code to your script.js file
document.getElementById('interrupt_button').addEventListener('click', interruptBot);

function interruptBot() {
  const responseContainer = document.getElementById('response_container');
  responseContainer.innerHTML = ''; // Clear the current response
  
  // Display a new message
  const newMessage = document.createElement('div');
  newMessage.classList.add('interrupted_message');
  newMessage.innerText = 'You have interrupted TogeeVision. Please ask your new question.';
  responseContainer.appendChild(newMessage);
}

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
  const prompt = data.get('prompt');

  // user's chat-stripe
  chatContainer.innerHTML += chatStripe(false, prompt, generateUniqueId());
  form.reset();

  // bot's chat-stripe
  const botUniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, '', botUniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const botMessageDiv = document.getElementById(botUniqueId);
  loader(botMessageDiv);

  // Call the ChatGPT API and get the response
  const response = await fetch('http://localhost:5001', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt
    })
  });

  clearInterval(loadInterval);

  const result = await response.json();

  // Update the bot's chat-stripe with the generated text
  const generatedText = result.bot;
  clearInterval(loadInterval);
  typetext(botMessageDiv, generatedText);

  // Increment userRequests counter
  userRequests += 1;


 
};

const handleTopicButtonClick = async (topic) => {
// User's chat-stripe
chatContainer.innerHTML += chatStripe(false, topic, generateUniqueId());
form.reset();

// Bot's chat-stripe
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
prompt: topic
})
});

clearInterval(loadInterval);

const result = await response.json();

// Update the bot's chat-stripe with the generated text
const generatedText = result.bot;
clearInterval(loadInterval);
typetext(messageDiv, generatedText);

// Increment userRequests counter
userRequests += 1;


};

// Add event listeners for topic buttons
const topicButtons = document.querySelectorAll('.topic_button');
topicButtons.forEach((button) => {
button.addEventListener('click', () => {
const topic = button.getAttribute('data-topic');
handleTopicButtonClick(topic);
});
document.getElementById('chat_form').addEventListener('submit', function(event) {
  event.preventDefault();

  // Your code for handling the form submission goes here
});

});

input.addEventListener('keydown', (e) => {
if (e.keyCode === 13) {
e.preventDefault();
handleSubmit(e);
}
});

