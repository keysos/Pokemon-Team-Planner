const pokemonSprite = document.getElementById("pokemon-img");
const nameSelect = document.querySelector(".pokemon-select");
const abilitySelect = document.querySelector(".ability-select");
const moveSelects = document.querySelectorAll(".move-select");
const itemSelect = document.querySelector(".item-select")

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const GEN_1_TO_3_COUNT = 386;

function formatName(name) {
    return name.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}


async function loadPokemonList() {
    const res = await fetch(`${POKEAPI_BASE}/pokemon?limit=${GEN_1_TO_3_COUNT}`);
    const data = await res.json();

    data.results.forEach((pokemon) => {
        const option = document.createElement("option");
        option.value = pokemon.name;
        option.textContent = formatName(pokemon.name);
        nameSelect.appendChild(option)
    });
}

async function loadHeldItems() {
    
    const res = await fetch(`${POKEAPI_BASE}/item-attribute/holdable`);
    const data = await res.json();

    const sortedItems = data.items.sort((a, b) => a.name.localeCompare(b.name));

    itemSelect.innerHTML = '<option value=""></option>';

    sortedItems.forEach((item) => { 
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = formatName(item.name);
        itemSelect.appendChild(option);
    });
}

async function loadPokemonDetail(pokemonName) {
    const res = await fetch(`${POKEAPI_BASE}/pokemon/${pokemonName}`);
    const data = await res.json();

    pokemonSprite.src = data.sprites.front_default;
    pokemonSprite.alt = `${formatName(data.name)} sprite`;

    abilitySelect.innerHTML = `<option value=""></option>`;
    data.abilities.forEach((entry) => {
        const option = document.createElement("option");
        option.value = entry.ability.name;
        option.textContent = formatName(entry.ability.name);
        abilitySelect.appendChild(option);
    })

    currentMovesList = data.moves.map((entry) => entry.move);
    updateMoveOptions();
}

nameSelect.addEventListener("change", (event) => {
    const selectedName = event.target.value;
    if (selectedName) {
        loadPokemonDetail(selectedName);
    }
})

loadPokemonList();
loadHeldItems();

/* MOVE LOGIC */

let currentMovesList = [];

function buildMoveOptionsHTML(excludeNames, selectedName) {

    let html = '<option value=""></option>';

    currentMovesList.forEach((move) => {
        const isExcluded = excludeNames.has(move.name) && move.name !== selectedName;
        if (isExcluded) return;

        const selectedAttr = move.name === selectedName ? " selected" : "";
        html += `<option value="${move.name}"${selectedAttr}>${formatName(move.name)}</option>`
    });
    return html;
}

function updateMoveOptions() {
    const selectedMoves = Array.from(moveSelects).map((select) => select.value);

    moveSelects.forEach((select, index) => {
        const otherSelected = selectedMoves.filter((_, i) => i !== index);
        const excludeNames = new Set(otherSelected.filter((name) => name !== ""));

        select.innerHTML = buildMoveOptionsHTML(excludeNames, select.value);
    })
}

moveSelects.forEach((select) => {
    select.addEventListener("change", updateMoveOptions);
});

