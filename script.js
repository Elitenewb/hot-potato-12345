// Configuration constants
const PAUSE_DURATION = 5000; // Pause duration in milliseconds (5 seconds)
const MIN_PLAY_TIME = 5000; // Minimum play time in milliseconds (5 seconds)
const MAX_PLAY_TIME = 20000; // Maximum play time in milliseconds (20 seconds)

// Wait for DOM to be ready before accessing elements
let audioPlayer, playingGif, pausedGif, placeholder, controlButton;
let isPlaying = false;
let timeout;
let cycleActive = false;

// Initialize DOM references and event listeners when DOM is ready
function initialize() {
  audioPlayer = document.getElementById("audioPlayer");
  playingGif = document.getElementById("playingGif");
  pausedGif = document.getElementById("pausedGif");
  placeholder = document.getElementById("placeholder");
  controlButton = document.getElementById("controlButton");

  // Add event listener for button click
  controlButton.addEventListener("click", toggleCycle);

  // Add error handling for audio
  audioPlayer.addEventListener("error", handleAudioError);
  audioPlayer.addEventListener("canplaythrough", handleAudioReady);
  audioPlayer.addEventListener("ended", () => {
    isPlaying = false;
    cycleActive = false;
    controlButton.innerText = "Start";
    clearTimeout(timeout);
    updateGifDisplay();
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}

function toggleCycle() {
  if (cycleActive) {
    stopCycle();
    controlButton.innerText = "Start";
  } else {
    startCycle();
    controlButton.innerText = "Stop";
  }
}

function startCycle() {
  cycleActive = true;
  placeholder.style.display = "none"; // Hide the placeholder when cycle starts
  togglePlayPause();
}

function stopCycle() {
  clearTimeout(timeout);
  try {
    audioPlayer.pause();
  } catch (error) {
    console.error("Error pausing audio in stopCycle:", error);
  }
  isPlaying = false;
  cycleActive = false;
  updateGifDisplay();
  placeholder.style.display = "block"; // Show the placeholder when cycle stops
}

function togglePlayPause() {
  if (isPlaying) {
    try {
      audioPlayer.pause();
      isPlaying = false;
      pausedGif.style.display = "block";
      playingGif.style.display = "none";
      scheduleNextToggle(PAUSE_DURATION);
    } catch (error) {
      console.error("Error pausing audio:", error);
      handleAudioError();
    }
  } else {
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaying = true;
          playingGif.style.display = "block";
          pausedGif.style.display = "none";
          scheduleNextToggle(randomPlayTime());
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          isPlaying = false;
          handleAudioError();
        });
    } else {
      // Fallback for older browsers
      isPlaying = true;
      playingGif.style.display = "block";
      pausedGif.style.display = "none";
      scheduleNextToggle(randomPlayTime());
    }
  }
}

function scheduleNextToggle(delay) {
  if (cycleActive) {
    timeout = setTimeout(togglePlayPause, delay);
  }
}

function randomPlayTime() {
  // Random time between MIN_PLAY_TIME and MAX_PLAY_TIME (inclusive)
  return Math.floor(Math.random() * (MAX_PLAY_TIME - MIN_PLAY_TIME + 1)) + MIN_PLAY_TIME;
}

function updateGifDisplay() {
  if (!isPlaying && !cycleActive) {
    playingGif.style.display = "none";
    pausedGif.style.display = "none";
    placeholder.style.display = "block"; // Ensure placeholder is shown when not active
  }
}

function handleAudioError() {
  console.error("Audio error occurred");
  stopCycle();
  alert("An error occurred with the audio. Please check your connection and try again.");
}

function handleAudioReady() {
  // Audio is ready to play
  console.log("Audio ready");
}
