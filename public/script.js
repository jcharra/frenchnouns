let current = "";
let currentGender = "";
let count = 0;
let correct = 0;
let starttime = 0;

async function next() {
  const res = await fetch("/api/noun");
  return await res.json();
}

async function show_next() {
  const data = await next();
  starttime = new Date();

  if (data.noun) {
    const [noun, gender, mp3] = data.noun;
    [current, currentGender] = [noun, gender];
    document.getElementById("word").innerHTML = current;
  } else {
    console.error("Error fetching noun");
    setTimeout(200, show_next);
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

  document.getElementById("stats").innerHTML = correct + " / " + count;
  document.getElementById("stats_perc").innerHTML = ((100 * correct) / count).toFixed(2) + "%";
  show_next();
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
}

show_next();
