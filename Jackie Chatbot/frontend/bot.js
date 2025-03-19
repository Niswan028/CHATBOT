// Function to send messages
function sendMessage() {
    const userInputField = document.getElementById("user-input");
    const userInput = userInputField.value.trim();
    if (!userInput) return;

    const chatBox = document.getElementById("chat-box");

    // Create a session if it doesn’t exist
    let sessionId = localStorage.getItem("chat_session");
    if (!sessionId) {
        sessionId = Date.now().toString(); 
        localStorage.setItem("chat_session", sessionId);
    }

    // Generate a user-friendly name for chat (First Message as Alias)
    let chatAlias = localStorage.getItem(`alias_${sessionId}`);
    if (!chatAlias) {
        chatAlias = userInput.length > 20 ? userInput.substring(0, 20) + "..." : userInput;
        localStorage.setItem(`alias_${sessionId}`, chatAlias);
    }

    // Append user message
    addMessage(userInput, "user");

    // Append to chat history with user-friendly name
    updateChatHistory(sessionId, chatAlias);

    // Show typing effect
    const botMessageContainer = document.createElement("p");
    botMessageContainer.className = "bot-msg";
    chatBox.appendChild(botMessageContainer);

    // Scroll to latest message
    chatBox.scrollTop = chatBox.scrollHeight;

    // Fetch AI response
    fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput, session_id: sessionId })
    })
    .then(response => response.json())
    .then(data => typeMessage(botMessageContainer, `Jackie: ${data.response}`))
    .catch(error => {
        console.error("Error:", error);
        botMessageContainer.innerHTML = `<p class="error-msg">Error: ${error.message}</p>`;
    });

    userInputField.value = "";
}

// Function to handle the Enter key press (prevents new line, sends message)
function handleKeyPress(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevents new line in input field
        sendMessage();
    }
}

// Function to add messages to chat
function addMessage(message, sender) {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("p");
    messageElement.className = sender === "user" ? "user-msg" : "bot-msg";
    messageElement.innerText = message;
    chatBox.appendChild(messageElement);
}

// Function to update and handle chat history
function updateChatHistory(sessionId, alias) {
    if (document.querySelector(`[data-session="${sessionId}"]`)) return; // Avoid duplicates

    const historyItem = document.createElement("li");
    historyItem.innerText = alias;
    historyItem.dataset.session = sessionId;
    historyItem.onclick = () => window.location.href = `chat.html?session=${sessionId}`;
    
    document.getElementById("chat-history").appendChild(historyItem);
}

// Function for typing effect
function typeMessage(element, text) {
    let index = 0;
    function type() {
        if (index < text.length) {
            element.innerHTML += text[index++];
            setTimeout(type, 30);
        }
    }
    type();
}

// Load Chat History on Startup
window.onload = function () {
    const chatHistory = document.getElementById("chat-history");

    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key.startsWith("alias_")) {
            let sessionId = key.replace("alias_", "");
            let alias = localStorage.getItem(key);
            
            updateChatHistory(sessionId, alias);
        }
    }
};
