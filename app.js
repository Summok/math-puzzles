// 1. Import what we exported in index.html
import { auth, db } 
  from "./index.html"; // since we did "export const auth/db" there

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 2. Grab DOM elements
const emailEl   = document.getElementById("email");
const passEl    = document.getElementById("password");
const btnReg    = document.getElementById("btn-register");
const btnLog    = document.getElementById("btn-login");
const btnOut    = document.getElementById("btn-logout");
const boardEl   = document.getElementById("scoreboard");

// 3. Registration & Login
btnReg.addEventListener("click", () => {
  createUserWithEmailAndPassword(auth, emailEl.value, passEl.value)
    .catch(e => alert(e.message));
});

btnLog.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, emailEl.value, passEl.value)
    .catch(e => alert(e.message));
});

btnOut.addEventListener("click", () => {
  signOut(auth);
});

// 4. React to auth state changes
onAuthStateChanged(auth, user => {
  if (user) {
    // show logout, hide login/register
    btnOut.hidden = false;
    btnReg.hidden = btnLog.hidden = true;
    loadScoreboard();
  } else {
    // show login/register, hide logout
    btnOut.hidden = true;
    btnReg.hidden = btnLog.hidden = false;
    boardEl.innerHTML = "";
  }
});

// 5. Load top-10 scores
async function loadScoreboard() {
  const q = query(
    collection(db, "scores"),
    orderBy("score", "desc"),
    limit(10)
  );
  const snap = await getDocs(q);
  boardEl.innerHTML = snap.docs
    .map(d => `<li>${d.data().user}: ${d.data().score}</li>`)
    .join("");
}

// 6. Function to save a new score
// Call this when a user submits an answer:
export async function saveScore(score) {
  if (!auth.currentUser) {
    alert("Please log in first!");
    return;
  }
  await addDoc(collection(db, "scores"), {
    user: auth.currentUser.email,
    score,
    timestamp: Date.now()
  });
  loadScoreboard();
}
