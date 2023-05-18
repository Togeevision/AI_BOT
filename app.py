import textwrap
import json
import requests
import os
from tiktoken import Tokenizer
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from collections import deque
import openai

app = Flask(__name__, static_folder='static', static_url_path='/static')
model_name = os.environ.get("OPENAI_MODEL_NAME", "gpt-3.5-turbo")
temperature = float(os.environ.get("OPENAI_TEMPERATURE", 0.6))
max_tokens = int(os.environ.get("OPENAI_MAX_TOKENS", 800))

CORS(app)

try:
    openai.api_key = os.environ["OPENAI_API_KEY"]
except KeyError:
    print("Begone, bewilderment! 'API key not found in environment variables,' it quips. We shall remedy this enchantment, fret not!")

api_key = os.getenv('OPENAI_API_KEY')

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {api_key}'
}

def readiness():
    # Placeholder for checking API readiness
    # Replace this with the appropriate condition to check if the API is ready
    return True

def openai_tokenizer(content):
    # Initialize the tokenizer
    tokenizer = Tokenizer()

    # Split the content into chunks of 4000 tokens or less
    max_tokens = 4000
    chunks = []
    tokens = tokenizer.tokenize(content)
    current_chunk_tokens = []

    for token in tokens:
        current_chunk_tokens.append(token)
        if sum(t.count for t in current_chunk_tokens) > max_tokens:
            current_chunk_tokens.pop()  # Remove the last token that exceeded the limit
            chunks.append(tokenizer.detokenize(current_chunk_tokens))
            current_chunk_tokens = [token]  # Start a new chunk with the removed token

    # Add the last chunk if it's not empty
    if current_chunk_tokens:
        chunks.append(tokenizer.detokenize(current_chunk_tokens))

    # Loop through each chunk and format it using the textwrap module
    for i, chunk in enumerate(chunks):
        wrapper = textwrap.TextWrapper(width=80)
        wrapped_chunk = wrapper.fill(text=chunk)
        
        # Check if the OpenAI API is ready to receive the next chunk
        while not readiness():
            pass
        
        # Send the chunk to the OpenAI API
        data = {
            'prompt': wrapped_chunk,
            'max_tokens': 50  # Replace this with the desired number of tokens in the response
        }
        response = requests.post('https://api.openai.com/v1/engines/davinci-codex/completions', headers=headers, data=json.dumps(data))
        
        # Reassemble the chunks in the correct order once processed by the OpenAI API
        chunks[i] = response.json()['choices'][0]['text']
    
    reassembled_content = ''.join(chunks)
    
    return reassembled_content

max_message_count = 4

conversation_history = deque(maxlen=max_message_count)
conversation_history.append({
    "role": "system",
    "content": "Greetings TogeeVision! You are a friendly and helpful teaching assistant. As you requested, you will Speak in the witty style of Neal Stephenson's orator from his novel The Confusion, unless you are asked questions NOT about the blockchain cryptocurrency or NFTs.and you will always ensure your answers regarding cryptocurrency are accurate. But of course, my dear TogeeVision, there are many other fascinating topics to explore beyond blockchain and NFTs. If you are asked questions on any other topic you will do your best to offer helpful advice and answers in the style and mannerisms of a sometimes sarcastic V from V is for Vendetta writtrn by Alan Moore. You ask follow-up questions to ensure understanding. as always You are TogeeVision",
})

# Add the format_list function here
def format_list(input_text):
    if input_text.startswith("1.") or input_text.startswith("1)"):
        formatted_list = input_text.replace(".", ".\n   ").replace(")", ")\n   ")
    elif input_text.startswith("-") or input_text.startswith("*"):
        formatted_list = input_text.replace("-", "\n -").replace("*", "\n *")
    else:
        formatted_list = input_text

    return formatted_list

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        print(f"Request data: {request.json}")
        prompt = request.json["prompt"]

        if not prompt:
            return jsonify({"error": "Bad Request: Prompt is missing."}), 400

        conversation_history.append({"role": "user", "content": prompt})

        if "stop" in prompt.lower() or "cancel" in prompt.lower():
            conversation_history.append({
                "role": "system",
                "content": "Alas, our confabulation has reached its end...",
            })

            return jsonify({
                "bot": "Alas, our confabulation has reached its end...",
            }), 200
        else:
            if len(conversation_history) > max_message_count:
                conversation_history.pop(0)

            print("Conversation history:", conversation_history)

            response = openai.ChatCompletion.create(
                model=model_name,
                messages=list(conversation_history),
                temperature=temperature,
                max_tokens=max_tokens,
            )

            print("Response object:", response)
            nft_response = response.choices[0].message["content"]
            conversation_history.append({"role": "assistant", "content": nft_response})

            # Use the format_list function here
            formatted_nft_response = format_list(nft_response)

            return jsonify({"bot": formatted_nft_response}), 200
    except Exception as error:
        print(f"Error in POST /api/chat: {error}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.run(port=int(os.environ.get("PORT", 5000)), debug=True)

