let current = "";
let currentGender = "";
let count = 0;
let correct = 0;
let starttime = 0;
const COUNT_LIMIT = 50;

function reset_values() {
  current = "";
  currentGender = "";
  count = 0;
  correct = 0;
  starttime = 0;

  const table = document.getElementById("history_table");
  while (table.rows.length > 0) {
    table.deleteRow(0);
  }

  document.getElementById("stats").innerHTML = "";
  document.getElementById("stats_perc").innerHTML = "";
}

async function next() {
  const res = await fetch("/api/noun");
  return await res.json();
}

async function display_next_word() {
  const data = await next();
  starttime = new Date();

  if (data.noun) {
    const [noun, gender, mp3] = data.noun;
    [current, currentGender] = [noun, gender];
    document.getElementById("word").innerHTML = current;
  } else {
    console.error("Error fetching noun");
    setTimeout(200, display_next_word);
  }
}

function evaluate_answer(gender) {
  const time_in_secs = ((new Date() - starttime) / 1000).toFixed(2);
  const isCorrect = gender === currentGender;
  if (isCorrect) {
    correct++;
  }

  push_history(current, isCorrect, time_in_secs);
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
  document.getElementById("stats_perc").innerHTML = ((100 * correct) / count).toFixed(2) + "%";
}

function display_result() {
  //document.getElementById("points").innerHTML = correct;
  const prec_squared = ((correct / count) ** 2).toFixed(2);
  //document.getElementById("prec_squared").innerHTML = prec_squared;
  const total = Math.round(prec_squared * correct);
  document.getElementById("total").innerHTML = total;
  show_section("result");
  reset_values();
}

function push_history(word, correct, time) {
  const table = document.getElementById("history_table");

  const tbody = table.getElementsByTagName("tbody")[0];

  const newRow = tbody.insertRow(0);

  const word_cell = newRow.insertCell(0);
  const eval_cell = newRow.insertCell(1);
  const time_cell = newRow.insertCell(2);
  word_cell.innerHTML = word;
  eval_cell.innerHTML = correct ? "✅" : "❌";
  time_cell.innerHTML = time + "s";

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
  show_section("game");
  display_next_word();
}
