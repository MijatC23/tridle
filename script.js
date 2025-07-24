// Tridle implementation inspired by the provided Java logic
const REC_DUZINA = 5;
const MAX_POKUSAJA = 6;
const BROJ_IGARA = 3;

let reci = [];
let trazene = [];
let pogodjene = [];
let pokusaj = 0;
let grid = [];

// Helper for feedback
const FeedBack = {
  GREEN: 'correct',
  YELLOW: 'present',
  GRAY: 'absent',
};

// Load words and initialize game
document.addEventListener('DOMContentLoaded', () => {
  console.log('Pokušavam da fetch-ujem reci5.txt...');
  fetch('reci5.txt')
    .then(res => {
      console.log('Fetch response:', res);
      if (!res.ok) throw new Error('Neuspešan fetch reci5.txt');
      return res.text();
    })
    .then(text => {
      reci = text.trim().split(/\r?\n/).map(r => r.trim().toLowerCase());
      console.log('Učitano reči:', reci.length, reci.slice(0, 10));
      startGame();
    })
    .catch(err => {
      console.error('Greška pri fetch-u reci5.txt:', err);
      document.getElementById('status').textContent = 'Ne mogu da učitam reci5.txt!';
    });

  document.getElementById('proveriBtn').onclick = proveriUnos;
  document.getElementById('resetBtn').onclick = resetujIgru;
  document.getElementById('input').addEventListener('keydown', e => {
    if (e.key === 'Enter') proveriUnos();
  });
});

function startGame() {
  trazene = [];
  pogodjene = [];
  pokusaj = 0;
  grid = [];
  for (let i = 0; i < BROJ_IGARA; i++) {
    trazene[i] = reci[Math.floor(Math.random() * reci.length)];
    pogodjene[i] = false;
  }
  console.log('Tajne reči:', trazene);
  inicijalizujTablu();
  document.getElementById('input').value = '';
  document.getElementById('input').disabled = false;
  document.getElementById('status').textContent = '';
}

function inicijalizujTablu() {
  for (let igra = 0; igra < BROJ_IGARA; igra++) {
    const gameDiv = document.getElementById(`game${igra + 1}`);
    gameDiv.innerHTML = '';
    grid[igra] = [];
    for (let red = 0; red < MAX_POKUSAJA; red++) {
      grid[igra][red] = [];
      for (let kol = 0; kol < REC_DUZINA; kol++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = '';
        gameDiv.appendChild(tile);
        grid[igra][red][kol] = tile;
      }
    }
  }
}

function proveriUnos() {
  const input = document.getElementById('input');
  const unos = input.value.trim().toLowerCase();
  console.log('Unos:', unos, '| Tajne:', trazene, '| Pokusaj:', pokusaj);
  if (unos.length !== REC_DUZINA || !reci.includes(unos)) {
    alert(`Reč mora imati ${REC_DUZINA} slova i postojati u rečniku.`);
    return;
  }

  for (let igra = 0; igra < BROJ_IGARA; igra++) {
    if (pogodjene[igra]) continue;
    const tacna = trazene[igra];
    const feedback = Array(REC_DUZINA).fill(null);
    const oznacena = Array(REC_DUZINA).fill(false);

    // GREEN
    for (let i = 0; i < REC_DUZINA; i++) {
      if (unos[i] === tacna[i]) {
        feedback[i] = FeedBack.GREEN;
        oznacena[i] = true;
      }
    }
    // YELLOW
    for (let i = 0; i < REC_DUZINA; i++) {
      if (!feedback[i]) {
        for (let j = 0; j < REC_DUZINA; j++) {
          if (!oznacena[j] && unos[i] === tacna[j]) {
            feedback[i] = FeedBack.YELLOW;
            oznacena[j] = true;
            break;
          }
        }
        if (!feedback[i]) feedback[i] = FeedBack.GRAY;
      }
    }
    // Render feedback
    for (let i = 0; i < REC_DUZINA; i++) {
      const polje = grid[igra][pokusaj][i];
      polje.textContent = unos[i].toUpperCase();
      polje.classList.remove('correct', 'present', 'absent');
      polje.classList.add(feedback[i]);
    }
    if (unos === tacna) {
      pogodjene[igra] = true;
    }
  }
  pokusaj++;
  input.value = '';

  if (pokusaj >= MAX_POKUSAJA || svePogodjene()) {
    let poruka = '';
    if (svePogodjene()) {
      poruka += 'Bravo! Pogodili ste sve reči!\n';
    } else {
      poruka += 'Kraj igre! Reči su bile:\n';
    }
    for (let i = 0; i < BROJ_IGARA; i++) {
      poruka += ` - ${trazene[i]}\n`;
    }
    document.getElementById('status').textContent = poruka;
    input.disabled = true;
    console.log('Kraj igre! Tajne reči su bile:', trazene);
  }
}

function svePogodjene() {
  return pogodjene.every(p => p);
}

function resetujIgru() {
  startGame();
}
