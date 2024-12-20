     // Accessing elements
     const startRecordingButton = document.getElementById("startRecording");
     const stopRecordingButton = document.getElementById("stopRecording");
     const audioPlayback = document.getElementById("audioPlayback");
     const notesTextArea = document.getElementById("notes");
     const notesContainer = document.getElementById("notesContainer");
     const saveNoteButton = document.getElementById("saveNote");
     const liveSpeechInputDiv = document.getElementById("liveSpeechInput");

     let mediaRecorder;
     let audioChunks = [];
     let audioBlob;
     let audioUrl;

     let recognition;
     let recognizing = false;

     // Initialize Speech Recognition
     if ('webkitSpeechRecognition' in window) {
         recognition = new webkitSpeechRecognition();
         recognition.lang = 'en-US'; // Set language to English
         recognition.continuous = true; // Keep listening until stopped
         recognition.interimResults = true; // Get intermediate results

         recognition.onresult = function(event) {
             let finalTranscript = '';
             let interimTranscript = '';
             // Loop through recognition results
             for (let i = event.resultIndex; i < event.results.length; i++) {
                 const transcript = event.results[i][0].transcript;
                 if (event.results[i].isFinal) {
                     // Append the final transcript to the textarea
                     finalTranscript += transcript + ' ';
                 } else {
                     // Display interim results for real-time feedback
                     interimTranscript += transcript;
                 }
             }
             
             // Update liveSpeechInputDiv with interim results for real-time feedback
             liveSpeechInputDiv.textContent = interimTranscript;

             // Update the textarea only with the final results
             notesTextArea.value += finalTranscript;
         };

         recognition.onerror = function(event) {
             console.error("Speech recognition error", event);
         };
     } else {
         alert("Speech recognition is not supported in your browser.");
     }

     // Load saved notes from localStorage when the page is loaded
     document.addEventListener("DOMContentLoaded", () => {
         const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
         savedNotes.forEach(note => {
             displayNote(note);
         });
     });

     // Save notes to localStorage as the user types
     notesTextArea.addEventListener("input", () => {
         localStorage.setItem("notes", JSON.stringify(notesTextArea.value)); // Save the notes in localStorage
     });

     // Function to save a note
     saveNoteButton.addEventListener("click", () => {
         const noteContent = notesTextArea.value.trim();
         if (noteContent) {
             const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
             savedNotes.push(noteContent);
             localStorage.setItem("notes", JSON.stringify(savedNotes));
             displayNote(noteContent); // Display the note
             notesTextArea.value = ''; // Clear the text area after saving
         }
     });

     // Function to display a note
     function displayNote(noteContent) {
         const noteDiv = document.createElement("div");
         noteDiv.classList.add("note");
         noteDiv.textContent = noteContent;

         const deleteButton = document.createElement("button");
         deleteButton.classList.add("delete-btn");
         deleteButton.textContent = "Delete";
         deleteButton.onclick = function() {
             deleteNote(noteContent, noteDiv);
         };

         noteDiv.appendChild(deleteButton);
         notesContainer.appendChild(noteDiv);
     }

     // Function to delete a note
     function deleteNote(noteContent, noteDiv) {
         const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
         const updatedNotes = savedNotes.filter(note => note !== noteContent);
         localStorage.setItem("notes", JSON.stringify(updatedNotes));
         notesContainer.removeChild(noteDiv);
     }

     // Start recording
     startRecordingButton.addEventListener("click", () => {
         // Reset UI and variables for a new recording session
         notesTextArea.value = '';  // Clear the textarea
         liveSpeechInputDiv.textContent = '';  // Clear the live speech input display
         audioPlayback.src = '';  // Clear the previous audio playback

         // Disable start button and enable stop button
         startRecordingButton.disabled = true;
         stopRecordingButton.disabled = false;

         // Start speech recognition
         if (!recognizing) {
             recognition.start();
             recognizing = true;
         }

         // Start audio recording
         navigator.mediaDevices.getUserMedia({ audio: true })
             .then(stream => {
                 mediaRecorder = new MediaRecorder(stream);
                 audioChunks = [];  // Clear previous audio chunks
                 mediaRecorder.ondataavailable = event => {
                     audioChunks.push(event.data);
                 };
                 mediaRecorder.onstop = () => {
                     audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                     audioUrl = URL.createObjectURL(audioBlob);
                     audioPlayback.src = audioUrl;
                 };

                 mediaRecorder.start();
             })
             .catch(error => {
                 console.error("Error accessing the microphone", error);
             });
     });

     // Stop recording
     stopRecordingButton.addEventListener("click", () => {
         // Stop both speech recognition and audio recording only when the stop button is clicked
         mediaRecorder.stop();
         recognition.stop(); // Stop speech recognition when stopping audio recording
         startRecordingButton.disabled = false;
         stopRecordingButton.disabled = true;
         recognizing = false;
     });

     // Download audio (optional feature)
     const downloadAudioButton = document.getElementById("downloadAudio");

     mediaRecorder.onstop = () => {
         audioBlob = new Blob(audioChunks, { type: "audio/wav" });
         audioUrl = URL.createObjectURL(audioBlob);
         audioPlayback.src = audioUrl;
         downloadAudioButton.disabled = false;

         downloadAudioButton.addEventListener("click", () => {
             const link = document.createElement("a");
             link.href = audioUrl;
             link.download = "recording.wav";
             link.click();
         });
     };

     
///Lightsss/////

function toggleClassPlayer() {
    const body = document.querySelector('body');
    body.classList.toggle('lightPlayer');
}
