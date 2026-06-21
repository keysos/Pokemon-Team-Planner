import { POKEAPI_BASE, POKEMON_LIMIT, GEN_RANGES } from "../utils/constants.js";
import { formatName, getDexNumber } from "../utils/helpers.js";
import { typeFilter, genFilter, pokemonCards } from "../dom.js";

let allPokemon = [];

// Get Pokemon filtered by type and generation
export async function getFilteredPokemon() {
    try {
        const type = typeFilter.value;
        const gen = genFilter.value;

        let result = allPokemon;

        if (type) {
            const res = await fetch(`${POKEAPI_BASE}/type/${type}`);
            const data = await res.json();
            const typeNames = new Set(data.pokemon.map(p => p.pokemon.name));
            result = result.filter(p => typeNames.has(p.name));
        }

        if (gen) {
            const [min, max] = GEN_RANGES[gen];
            result = result.filter(p => {
                const num = getDexNumber(p.url);
                return num >= min && num <= max;
            });
        }

        return result;
    } catch (err) {
        console.warn("Type and gen filter failed:", err);
    }
}

// Populate all Pokemon select elements with filtered Pokemon
export async function populatePokemonSelects() {
    try {
        const filtered = await getFilteredPokemon();
        const selects = document.querySelectorAll(".pokemon-select");

        selects.forEach(select => {
            const current = select.value;

            select.innerHTML = '<option value="" disabled selected hidden>Name</option>';

            filtered.forEach(pokemon => {
                const option = document.createElement("option");
                option.value = pokemon.name;
                option.textContent = formatName(pokemon.name);
                select.appendChild(option);
            });

            if (filtered.some(p => p.name === current)) {
                select.value = current;
            } else if (current) {
                const option = document.createElement("option");
                option.value = current;
                option.textContent = formatName(current);
                option.disabled = true;
                select.appendChild(option);
                select.value = current;
            }
        });
    } catch (err) {
        console.error("Failed to load pokemons", err);
    }
}

// Populate all item select elements
export async function populateItemSelects() {
    try {
        const res = await fetch(`${POKEAPI_BASE}/item-attribute/holdable`);
        const data = await res.json();

        const sortedItems = data.items.sort((a, b) => a.name.localeCompare(b.name));

        const itemSelects = document.querySelectorAll(".item-select");

        itemSelects.forEach(select => {
            select.innerHTML = '<option value="" disabled selected hidden>Item</option>';
            sortedItems.forEach(item => {
                const option = document.createElement("Option");
                option.value = item.name;
                option.textContent = formatName(item.name);
                select.appendChild(option);
            })
        })
    } catch (err) {
        console.error("Item load failed:", err);
    }
}

// Build an array with current team Pokemon, their types, their selected moves,
// and their card slot index (used to dedupe scoring safely even if two cards
// have the same species selected)
export async function buildCurrentTeam() {
    const team = [];
    const cards = Array.from(pokemonCards);

    for (let index = 0; index < cards.length; index++) {
        const card = cards[index];
        const pokemonName = card.querySelector(".pokemon-select").value;

        if (!pokemonName) continue;

        try {
            const res = await fetch(`${POKEAPI_BASE}/pokemon/${pokemonName}`);
            const data = await res.json();
            
            const moveSelects = card.querySelectorAll(".move-select");
            const moves = Array.from(moveSelects)
                .map(select => ({
                    name: select.value,
                    type: select.className.replace("move-select", "").trim(),
                    damageClass: select.dataset.damageClass || ""
                }))
                .filter(move => move.name && move.type);

            team.push({
                index,
                name: pokemonName,
                types: data.types.map(t => t.type.name),
                moves
            });
        } catch (err) {
            console.error(err);
        }
    }

    return team;
}

// Initialize all Pokemon data
export async function initializeAllPokemon() {
    try {
        const res = await fetch(`${POKEAPI_BASE}/pokemon?limit=${POKEMON_LIMIT}`);
        const data = await res.json();
        allPokemon = data.results;
    } catch (err) {
        console.error("Failed to initialize Pokemon:", err);
    }
}
