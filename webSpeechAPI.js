let recognizing = false;

var recognition;
if (navigator.userAgent.includes("Firefox")) {
  recognition = new SpeechRecognition();
} else {
  recognition = new webkitSpeechRecognition();
}

recognition.continuous = true;
recognition.interimResults = false;

recognition.onend = function () {
  if (recognizing) {
    console.log("Reconocimiento detenido, reiniciando...");
    recognition.start();
  } else {
    console.log("Reconocimiento finalizado.");
    reset();
  }
};

recognition.onresult = function (event) {
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      const transcript = event.results[i][0].transcript.trim();
      console.log("Texto reconocido:", transcript);
      if (transcript.length > 0) {
        chat(transcript);
      }
    }
  }
};

function reset() {
  recognizing = false;
  speakButton.classList.remove("listening");
  connectionLabel.innerHTML = "Online";
  chatButton.removeAttribute("disabled");
  speakButton.removeAttribute("disabled");
}

function toggleStartStop() {
  if (recognizing) {
      console.log("Deteniendo reconocimiento de voz...");
      recognition.stop();
      reset();
  } else {
      console.log("Iniciando reconocimiento de voz...");
      recognition.start();
      recognizing = true;
      speakButton.classList.add("listening");
      connectionLabel.innerHTML = "Escuchando...";
  }
}
function chat(transcript) {
  if (transcript !== "") {
    showNotification(transcript);
    let chat = window.agentManager.chat(transcript);
    console.log("agentManager.chat()", transcript);
    connectionLabel.innerHTML = "Pensando...";
  }
}

function showNotification(message) {
  const notificationContainer = document.querySelector(
    "#notification-container"
  );
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = message;
  notificationContainer.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 4000);
}
