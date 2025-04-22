// 1. Grab the global firebase services
const auth = firebase.auth();
const db   = firebase.firestore();

// 2. Grab DOM elements
const emailEl = document.getElementById("email");
const passEl  = document.getElementById("password");
const btnReg  = document.getElementById("btn-register");
const btnLog  = document.getElementById("btn-login");
const btnOut  = document.getElementById("btn-logout");
const boardEl = document.getElementById("scoreboard");

// 3. Register & Login handlers
btnReg.addEventListener("click", () => {
  auth.createUserWithEmailAndPassword(emailEl.value, passEl.value)
      .catch(e => alert(e.message));
});
btnLog.addEventListener("click", () => {
  auth.signInWithEmailAndPassword(emailEl.value, passEl.value)
      .catch(e => alert(e.message));
});
btnOut.addEventListener("click", () => auth.signOut());

// 4. React to auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    btnOut.hidden = false;
    btnReg.hidden = btnLog.hidden = true;
    loadScoreboard();
  } else {
    btnOut.hidden = true;
    btnReg.hidden = btnLog.hidden = false;
    boardEl.innerHTML = "";
  }
});

// 5. Load Top‑10 scores
async function loadScoreboard() {
  const snapshot = await db.collection("scores")
                           .orderBy("score", "desc")
                           .limit(10)
                           .get();
  boardEl.innerHTML = snapshot.docs
    .map(d => `<li>${d.data().user}: ${d.data().score}</li>`)
    .join("");
}

// 6. Call this when a user finishes a puzzle:
function saveScore(score) {
  if (!auth.currentUser) {
    alert("Please log in first!");
    return;
  }
  db.collection("scores").add({
    user:      auth.currentUser.email,
    score,
    timestamp: Date.now()
  }).then(loadScoreboard)
    .catch(e => alert(e.message));
}

// Make saveScore available from console for quick testing:
window.saveScore = saveScore;
