let current = "";
let currentGender = "";
let count = 0;
let correct = 0;
let starttime = 0;
let score = 0;
let confetti_end_time = 0;
let input_blocked = true;
const COUNT_LIMIT = 50;

function reset_values() {
  current = "";
  currentGender = "";
  count = 0;
  correct = 0;
  starttime = 0;
  score = 0;

  const table = document.getElementById("history_table");
  while (table.rows.length > 0) {
    table.deleteRow(0);
  }

  document.getElementById("stats").innerHTML = "";
  document.getElementById("stats_perc").innerHTML = "";
  document.getElementById("stats_points").innerHTML = "";
  document.getElementById("classification").innerHTML = "";
  document.getElementById("classification").classList.remove("fadein");
}

async function next() {
  input_blocked = true;
  const res = await fetch("/api/noun");
  const word = await res.json();
  input_blocked = false;
  return word;
}

async function display_next_word() {
  document.getElementById("word").innerHTML = "...";
  const data = await next();

  if (data.noun) {
    const [noun, gender] = data.noun;
    [current, currentGender] = [noun, gender];
    document.getElementById("word").innerHTML = current;
    starttime = new Date();
  } else {
    console.error("Error fetching noun");
    setTimeout(200, display_next_word);
  }
}

function evaluate_answer(gender) {
  if (input_blocked) {
    return;
  }
  const time_in_secs = ((new Date() - starttime) / 1000).toFixed(2);
  const isCorrect = gender === currentGender;
  let word_score = 0;
  if (isCorrect) {
    correct++;
    const time_bonus = Math.max(0, 5 - time_in_secs);
    // 5 points minimum for a correct answer
    word_score = Math.max(5, Math.round(time_bonus * 10) + 1);
    score += word_score;
  }

  push_history(currentGender, current, isCorrect, time_in_secs, word_score);
  count++;

  refresh_stats();

  if (count < COUNT_LIMIT) {
    display_next_word();
  } else {
    display_result();
  }
}

function refresh_stats() {
  document.getElementById("stats").innerHTML = correct + " / " + count;
  document.getElementById("stats_perc").innerHTML = "Précision: " + ((100 * correct) / count).toFixed(2) + "%";
  document.getElementById("stats_points").innerHTML = "Points: " + score;
}

const classifications = ["Débutant(e)", "Pas mal", "Avancé(e)", "Expert(e)", "Langue maternelle"];
function getLevel(score) {
  if (score > 1500) {
    return 4;
  } else if (score > 1250) {
    return 3;
  } else if (score > 1000) {
    return 2;
  } else if (score > 750) {
    return 1;
  } else {
    return 0;
  }
}

function display_result() {
  document.getElementById("points").innerHTML = score;
  document.getElementById("points_desc").innerHTML = score;
  const precision = correct / count;
  const prec_squared = (precision ** 2).toFixed(2);
  document.getElementById("precision").innerHTML = (100 * precision).toFixed(2) + "%";
  document.getElementById("prec_squared").innerHTML = prec_squared;
  const total = Math.round(prec_squared * score);
  document.getElementById("total").innerHTML = total;
  show_section("result");
  const classification = document.getElementById("classification");
  const niveau = getLevel(total);
  classification.innerHTML = "Niveau: " + classifications[niveau];
  setTimeout(() => classification.classList.add("fadein"), 100);
  if (niveau > 0) {
    confetti_end_time = Date.now() + niveau * 500;
    party();
  }
}

function push_history(gender, word, correct, time, word_score) {
  const table = document.getElementById("history_table");

  const tbody = table.getElementsByTagName("tbody")[0];

  const newRow = tbody.insertRow(0);

  const gender_symbol_cell = newRow.insertCell(0);
  const word_cell = newRow.insertCell(1);
  const eval_cell = newRow.insertCell(2);
  const time_cell = newRow.insertCell(3);
  const word_score_cell = newRow.insertCell(4);

  gender_symbol_cell.innerHTML = gender === "f" ? "♀" : "♂";
  word_cell.innerHTML = word;
  eval_cell.innerHTML = correct ? "✅" : "❌";
  time_cell.innerHTML = time + "s";
  word_score_cell.innerHTML = word_score + "P";
  word_score_cell.style.textAlign = "right";

  word_cell.classList.add("wide_cell");
}

function show_section(section_id) {
  const intro_elem = document.getElementById("intro");
  const game_elem = document.getElementById("game");
  const result_elem = document.getElementById("result");

  for (const elem of [intro_elem, game_elem, result_elem]) {
    if (elem.id === section_id) {
      elem.classList.remove("hidden");
    } else {
      elem.classList.add("hidden");
    }
  }
}

function start() {
  reset_values();
  show_section("game");
  display_next_word();
}

const colors = ["#bb0000", "#ffffff", "#ffff00", "00ff00", "0000ff"];
function party() {
  confetti({
    particleCount: 5,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: colors,
  });
  confetti({
    particleCount: 5,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: colors,
  });

  if (Date.now() < confetti_end_time) {
    requestAnimationFrame(party);
  }
}

// Avoid double tap zoom on iphone
let lastTouchEnd = 0;
let doublecount = 0;
document.addEventListener("touchend", (event) => {
  const now = new Date().getTime();
  if (now - lastTouchEnd <= 200 && doublecount === 0) {
    event.preventDefault();
    doublecount = 1;
  } else {
    doublecount = 0;
  }
  lastTouchEnd = now;
});

function toggleInfo() {
  const info = document.getElementById("info");
  if (info.classList.contains("maximized")) {
    info.classList.remove("maximized");
  } else {
    info.classList.add("maximized");
  }
}
