const bot = '/static/assets/bot.svg';
const user = '/static/assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const input = document.querySelector('textarea[name="prompt"]');
let loadInterval;

// Counter for user requests
let userRequests = 0;

document.getElementById('interrupt_button').addEventListener('click', interruptBot);

function interruptBot() {
  const responseContainer = document.getElementById('response_container');
  responseContainer.innerHTML = '';

  const newMessage = document.createElement('div');
  newMessage.classList.add('interrupted_message');
  newMessage.innerText = 'Thou hast disrupted TogeeVision. Pray, present thy new inquiry.';
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
      if (text.charAt(index) === '<' && text.substr(index, 4) === '<br>') {
        element.innerHTML += '<br>';
        index += 4;
      } else if (text.charAt(index) === '<' && text.substr(index, 28) === '<span class="numbered-item">') {
        element.innerHTML += '<span class="numbered-item">';
        index += 28;
      } else if (text.charAt(index) === '<' && text.substr(index, 7) === '</span>') {
        element.innerHTML += '</span>';
        index += 7;
      } else {
        element.innerHTML += text.charAt(index);
        index++;
      }
    } else {
      clearInterval(interval);
    }
  }, 20);
}



function formatList(rawText) {
  const formattedText = rawText.replace(/(\d+\.)\s/g, (match) => `<br><span class="numbered-item">${match} `);
  return formattedText;
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function sendEmail(email) {
  var message = "Thank you for your interest in TogeeVision! We will be in touch soon.";
  var mailOptions = {
    to: email,
    subject: "TogeeVision Contact Form",
    text: message
  };

  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "your_email@gmail.com",
      pass: "your_password"
    }
  });

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent!");
    }
  });
}

function chatStripe(isAI, value, uniqueId) {
  return `
    <div class="wrapper ${isAI ? 'ai' : 'user'}">
      <div class="chat">
        <div class="message" id="${uniqueId}">
          <div class="${isAI ? 'bot-response' : 'user-query'}">
            ${value}
          </div>
        </div>
      </div>
    </div>
  `;
}

async function handleTopicButtonClick(topic) {
  chatContainer.innerHTML += chatStripe(false, topic, generateUniqueId());
  form.reset();

  const botUniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, '', botUniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const botMessageDiv = document.getElementById(botUniqueId);
  loader(botMessageDiv);

  const response = await fetch('/api/chat', {
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

  // Formatting the text
  const formattedText = formatList(generatedText);

clearInterval(loadInterval);
typetext(botMessageDiv, formattedText);


  userRequests += 1;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const prompt = data.get('prompt');
  handleTopicButtonClick(prompt);
});

const topicButtons = document.querySelectorAll('.topic_button');
topicButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const topic = button.getAttribute('data-topic');
    handleTopicButtonClick(topic);
  });
});
