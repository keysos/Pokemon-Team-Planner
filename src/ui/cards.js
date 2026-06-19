import { POKEAPI_BASE } from "../utils/constants.js";
import { formatName } from "../utils/helpers.js";
import { pokemonCards } from "../dom.js";
import { saveParty } from "../storage/partyStorage.js";
import { updateTeamDefense } from "./defenseTable.js";

// Initialize card event listeners for each Pokemon card
export function initializeCardListeners() {
    pokemonCards.forEach(card => {
        const sprite = card.querySelector(".pokemon-img");
        const pokemonSelect = card.querySelector(".pokemon-select");
        const abilitySelect = card.querySelector(".ability-select");
        const moveSelects = card.querySelectorAll(".move-select");
        const pokemonTypeContainer = card.querySelector(".pokemon-type");

        let currentMoves = [];

        abilitySelect.disabled = true;
        moveSelects.forEach(select => select.disabled = true);

        pokemonSelect.addEventListener("change", async e => {
            try {
                const pokemonName = e.target.value;

                if (!pokemonName) return;

                abilitySelect.disabled = false;
                moveSelects.forEach(select => select.disabled = false);

                const res = await fetch(`${POKEAPI_BASE}/pokemon/${pokemonName}`);
                const data = await res.json();

                sprite.src = data.sprites.versions["generation-v"]["black-white"].animated.front_default;

                pokemonTypeContainer.innerHTML = '';

                data.types.forEach(entry => {
                    const div = document.createElement("div");
                    div.classList.add("type", entry.type.name);
                    div.textContent = formatName(entry.type.name);
                    pokemonTypeContainer.appendChild(div);
                })

                abilitySelect.innerHTML = '<option value="" disabled selected hidden>Ability</option>';
                data.abilities.forEach(entry => {
                    const option = document.createElement("option");
                    option.value = entry.ability.name;
                    option.textContent = formatName(entry.ability.name);
                    abilitySelect.appendChild(option);
                });

                currentMoves = (await Promise.all(
                    data.moves.map(async ({ move }) => {
                        try {
                            const res = await fetch(move.url);
                            const moveData = await res.json();

                            return {
                                name: move.name,
                                type: moveData.type.name
                            };
                        } catch (err) {
                            return null;
                        }
                    })
                )).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));

                currentMoves = currentMoves.filter(Boolean);

                updateMoveOptions();

                saveParty();
                await updateTeamDefense();
            } catch (err) {
                console.error("Pokemon load failed:", err);
            }
        });

        function buildMoveOptionsHTML(excludeNames, selectedName) {
            let html = '<option value="">Move</option>';

            currentMoves.forEach(move => {
                const isExcluded = excludeNames.has(move.name) && move.name !== selectedName;

                if (isExcluded) return;

                const selected = move.name === selectedName ? " selected" : "";

                html += `<option value="${move.name}"${selected} class="${move.type}">${formatName(move.name)}</option>`;
            });

            return html;
        }

        function updateMoveOptions() {
            const selectedMoves = Array.from(moveSelects).map(s => s.value);

            moveSelects.forEach((select, index) => {
                const otherSelected = selectedMoves.filter((_, i) => i !== index);
                const excludeNames = new Set(otherSelected.filter(Boolean));
                select.innerHTML = buildMoveOptionsHTML(excludeNames, select.value);

                const move = currentMoves.find(m => m.name === select.value);

                select.className = `move-select ${move?.type ?? ""}`
            });
        }

        moveSelects.forEach(select => {
            select.addEventListener("change", () => {
                updateMoveOptions();
                saveParty();
            });
        });

        abilitySelect.addEventListener("change", saveParty);
        card.querySelector(".item-select").addEventListener("change", saveParty);
    });
}
