function sendMessage() {
    const userInputField = document.getElementById("user-input");
    const userInput = userInputField.value.trim();
    if (!userInput) return;

    const chatBox = document.getElementById("chat-box");
    const userMessage = `<p class="user-msg">You: ${userInput}</p>`;
    chatBox.innerHTML += userMessage;
    
    // Get or create session ID
    let sessionId = localStorage.getItem('chat_session') || Date.now().toString();
    localStorage.setItem('chat_session', sessionId);

    // Show typing effect
    const botMessageContainer = document.createElement("p");
    botMessageContainer.className = "bot-msg";
    chatBox.appendChild(botMessageContainer);

    // Send message to backend
    fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: userInput,
            session_id: sessionId
        })
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        if (data.error) throw new Error(data.error);
        typeMessage(botMessageContainer, `Jackie: ${data.response}`);
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => {
        console.error("Fetch error:", error);
        botMessageContainer.innerHTML = `<p class="error-msg">Error: ${error.message}</p>`;
    });

    userInputField.value = "";
}

// Typewriter Effect
function typeMessage(element, text) {
    let index = 0;
    function type() {
        if (index < text.length) {
            element.innerHTML += text[index];
            index++;
            setTimeout(type, 30);
        }
    }
    type();
}

// Allow sending messages by pressing Enter
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}
