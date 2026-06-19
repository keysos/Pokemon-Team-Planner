import { pokemonCards } from "../dom.js";

// Save current party to session storage
export function saveParty() {
    const team = Array.from(pokemonCards).map(card => ({
        pokemon: card.querySelector(".pokemon-select").value,
        item: card.querySelector(".item-select").value,
        ability: card.querySelector(".ability-select").value,
        moves: Array.from(card.querySelectorAll(".move-select")).map(s => ({
            name: s.value,
            type: s.className.replace("move-select", "").trim()
        }))
    }));

    sessionStorage.setItem("pokemonParty", JSON.stringify(team));
}

// Load party from session storage and restore UI state
export async function loadParty(populatePokemonSelects) {
    try {
        const saved = sessionStorage.getItem("pokemonParty");

        if (!saved) return;

        const team = JSON.parse(saved);

        await populatePokemonSelects();

        for (let i = 0; i < pokemonCards.length; i++) {
            const card = pokemonCards[i];
            const savedCard = team[i];

            if (!savedCard?.pokemon) continue;

            const pokemonSelect = card.querySelector(".pokemon-select");
            const abilitySelect = card.querySelector(".ability-select");
            const moveSelects = card.querySelectorAll(".move-select");
            const itemSelect = card.querySelector(".item-select");

            pokemonSelect.value = savedCard.pokemon;

            try {
                pokemonSelect.dispatchEvent(new Event("change"));
            } catch (e) {
                console.warn("Pokemon load failed:", e);
            }

            await new Promise(resolve => setTimeout(resolve, 400));

            abilitySelect.value = savedCard.ability;
            itemSelect.value = savedCard.item;
            moveSelects.forEach((select, i) => {
                const saved = savedCard.moves[i];
                select.value = saved?.name ?? "";
                select.className = `move-select ${saved?.type ?? ""}`.trim();
            });
        }
    } catch (err) {
        console.warn("Pokemon load failed:", err);
    }
}
