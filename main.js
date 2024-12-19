import './style.css'
import * as sdk from "./node_modules/@d-id/client-sdk/dist/index.js";

let agentId = "agt_PVbsZwm9"
let auth = { type: 'key', clientKey: "Z29vZ2xlLW9hdXRoMnwxMTA2MDgxNzMwMzc3NTAyMjU4NzE6Qlg0QXFrX2d1NkZJS1Y0MTFEY2VQ" };
let videoElement = document.querySelector("#videoElement")
let textArea = document.querySelector("#textArea")
let connectionLabel = document.querySelector("#connectionLabel")
let chatButton = document.querySelector('#chatButton')
let speakButton = document.querySelector('#speakButton')
let reconnectButton = document.querySelector('#reconnectButton')
let srcObject

const callbacks = {
    onSrcObjectReady(value) {
        console.log("onSrcObjectReady():", value)
        videoElement.srcObject = value
        srcObject = value
        return srcObject
    },
    onConnectionStateChange(state) {
        console.log("onConnectionStateChange(): ", state);
        if (state == "connecting") {
            connectionLabel.innerHTML = "Connecting..";
            document.querySelector("#container").style.display = "flex";
            document.querySelector("#hidden").style.display = "none";
        }
        else if (state == "connected") {
            textArea.addEventListener("keypress", (event) => {
                if (event.key === "Enter") {
                  event.preventDefault(); 
                  chat();
                }
              });            chatButton.removeAttribute("disabled");
            speakButton.removeAttribute("disabled");
            connectionLabel.innerHTML = "Online";
            setTimeout(() => {
                agentManager.speak({
                    type: "text",
                    input: "¡Ho ho ho! ¡Feliz Navidad! Soy Santa Claus de Advance SPC; ¿Cuéntame qué sueños tienes para este 2025?"
                });
                console.log("Agent spoke: Feliz Navidad");
            }, 1000); 
        }
        else if (state == "disconnected" || state == "closed") {
            textArea.removeEventListener('keypress', (event) => { if (event.key === "Enter") { event.preventDefault(); chat(); } });
            document.querySelector("#hidden_h2").innerHTML = `${agentManager.agent.preview_name} Disconnected`;
            document.querySelector("#hidden").style.display = "block";
            document.querySelector("#container").style.display = "none";
            chatButton.setAttribute("disabled", true);
            speakButton.setAttribute("disabled", true);
            connectionLabel.innerHTML = "";
        }
    },
    onVideoStateChange(state) {
      console.log("onVideoStateChange(): ", state)
      if (state == "STOP") {
          videoElement.muted = true
          videoElement.srcObject = undefined
          videoElement.src = agentManager.agent.presenter.idle_video
      }
      else {
          videoElement.muted = false
          videoElement.src = ""
          videoElement.srcObject = srcObject
          connectionLabel.innerHTML = "Online"
      }
  },
  onNewMessage(messages, type) {
    console.log("onNewMessage():", messages, type);
},
    onError(error, errorData) {
        connectionLabel.innerHTML = `<span style="color:red">Something went wrong :(</span>`
        console.log("Error:", error, "Error Data", errorData)
    }
}

let streamOptions = { compatibilityMode: "auto", streamWarmup: true }
function speak() {
    let val = textArea.value
    if (val !== "" && val.length > 2) {
        let speak = agentManager.speak(
            {
                type: "text",
                input: val
            }
        )
        console.log(`agentManager.speak("${val}")`)
        connectionLabel.innerHTML = "Streaming.."
    }
}

function showNotification(message) {
    const notificationContainer = document.querySelector("#notification-container");
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 4000); // 5 segundos
}

function chat() {
    let val = textArea.value;
    if (val !== "") {
        showNotification(val);
        let chat = agentManager.chat(val);
        console.log("agentManager.chat()");
        connectionLabel.innerHTML = "Pensando..";
        textArea.value = "";
    }
}

function rate(messageID, score) {
    let rate = agentManager.rate(messageID, score)
    console.log(`Message ID: ${messageID} Rated:${score}\n`, "Result", rate)
}

function reconnect() {
    console.log("clicked")
    let reconnect = agentManager.reconnect()
    console.log("agentManager.reconnect()", reconnect)
}

function disconnect() {
    let disconnect = agentManager.disconnect()
    console.log("agentManager.disconnect()", disconnect)
}

function timeDisplay() {
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    return formattedTime;
}

if (agentId == "" || auth.clientKey == "") {
    connectionLabel.innerHTML = `<span style='color:red; font-weight:bold'> Missing agentID and auth.clientKey variables</span>`

    console.error("Missing agentID and auth.clientKey variables")
    console.log(`Missing agentID and auth.clientKey variables:\n\nFetch the data-client-key and the data-agent-id as explained on the Agents SDK Overview Page:\nhttps://docs.d-id.com/reference/agents-sdk-overview\n\nPaste these into their respective variables at the top of the main.js file and save.`)
}

chatButton.addEventListener('click', () => chat())
speakButton.addEventListener("click", () => {
    toggleStartStop();
});

reconnectButton.addEventListener('click', () => reconnect())

window.addEventListener('load', () => {
    textArea.focus(),
        chatButton.setAttribute("disabled", true)
    speakButton.setAttribute("disabled", true)
})

let agentManager = await sdk.createAgentManager(agentId, { auth, callbacks, streamOptions });
window.agentManager = agentManager;

console.log("sdk.createAgentManager()", agentManager)

document.querySelector("#previewName").innerHTML = agentManager.agent.preview_name

document.querySelector("#videoElement").style.backgroundImage = `url(${agentManager.agent.presenter.source_url})`

console.log("agentManager.connect()")
agentManager.connect()