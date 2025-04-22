// 1. Import functions from the Firebase SDKs
// Using CDN URLs for direct browser use without a build step
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp // Use server timestamp for consistency
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// 2. 🔥 Paste your real Firebase project configuration here
// Get this from your Firebase project settings > General > Your apps > SDK setup and configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMc_xd6t9xLnkRUG6Oq2Rw5sK9hgfJouI",
  authDomain: "math-puzzles-17f9e.firebaseapp.com",
  projectId: "math-puzzles-17f9e",
  storageBucket: "math-puzzles-17f9e.firebasestorage.app",
  messagingSenderId: "218812391235",
  appId: "1:218812391235:web:ab76e465044fc2af7359f6",
  measurementId: "G-WHXWNYGGQT"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Get references to Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// 5. Grab DOM elements
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const btnReg = document.getElementById("btn-register");
const btnLog = document.getElementById("btn-login");
const btnOut = document.getElementById("btn-logout");
const boardEl = document.getElementById("scoreboard");

// 6. Register & Login handlers (using modular syntax)
btnReg.addEventListener("click", async () => {
  const email = emailEl.value;
  const password = passEl.value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered:", userCredential.user);
    // Optionally clear fields or give success message
    emailEl.value = '';
    passEl.value = '';
  } catch (e) {
    console.error("Registration error:", e);
    alert(`Registration failed: ${e.message}`);
  }
});

btnLog.addEventListener("click", async () => {
  const email = emailEl.value;
  const password = passEl.value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    // Optionally clear fields
     emailEl.value = '';
     passEl.value = '';
  } catch (e) {
    console.error("Login error:", e);
    alert(`Login failed: ${e.message}`);
  }
});

btnOut.addEventListener("click", async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (e) {
    console.error("Sign out error:", e);
    alert(`Sign out failed: ${e.message}`);
  }
});

// 7. React to auth state changes (using modular syntax)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log("Auth state changed: Signed in as", user.email);
    btnOut.hidden = false;
    btnReg.hidden = btnLog.hidden = true;
    loadScoreboard(); // Load scores when user logs in
  } else {
    // User is signed out
    console.log("Auth state changed: Signed out");
    btnOut.hidden = true;
    btnReg.hidden = btnLog.hidden = false;
    boardEl.innerHTML = "<li>Please log in to see scores.</li>"; // Clear scoreboard or show message
  }
});

// 8. Load Top‑10 scores function (using modular syntax)
async function loadScoreboard() {
  console.log("Loading scoreboard...");
  // Define the query
  const scoresRef = collection(db, "scores");
  const q = query(scoresRef, orderBy("score", "desc"), limit(10));

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        boardEl.innerHTML = "<li>No scores submitted yet.</li>";
        return;
    }
    boardEl.innerHTML = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        // Display username part of email, or 'Anonymous' if user field is missing
        const userName = data.user ? data.user.split('@')[0] : 'Anonymous';
        return `<li>${userName}: ${data.score}</li>`;
      })
      .join("");
    console.log("Scoreboard loaded successfully.");
  } catch (e) {
    console.error("Error loading scoreboard: ", e);
    boardEl.innerHTML = "<li>Error loading scores.</li>";
    alert("Could not load scoreboard.");
  }
}

// 9. Save score function (using modular syntax)
async function saveScore(score) {
  const currentUser = auth.currentUser; // Get current user directly from auth service

  if (!currentUser) {
    alert("Please log in first to save your score!");
    return;
  }

  if (typeof score !== 'number' || score < 0) {
      alert("Invalid score provided.");
      return;
  }

  console.log(`Saving score: ${score} for user: ${currentUser.email}`);
  try {
    // Add a new document with a generated id to the 'scores' collection
    const docRef = await addDoc(collection(db, "scores"), {
      user: currentUser.email, // Use the logged-in user's email
      score: score,            // The score passed to the function
      timestamp: serverTimestamp() // Use Firestore server timestamp
    });
    console.log("Score saved with ID: ", docRef.id);
    loadScoreboard(); // Refresh the scoreboard after saving
  } catch (e) {
    console.error("Error saving score: ", e);
    alert(`Failed to save score: ${e.message}`);
  }
}

// 10. Make saveScore available from console for quick testing:
// e.g., type `saveScore(100)` in the browser console after logging in.
window.saveScore = saveScore;

// Note: No initial loadScoreboard() call here is needed,
// as onAuthStateChanged handles the initial state check when the script loads.
