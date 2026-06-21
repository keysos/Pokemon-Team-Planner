import { DISPLAY_TYPES } from "../utils/constants.js";
import { calculateTeamOffense } from "../utils/attackCalculator.js";
import { buildCurrentTeam } from "./pokemonSelects.js";
import { formatName } from "../utils/helpers.js";
import { attachAttackTooltips } from "../events/listeners.js";

// Render the team attack (super-effective coverage) table
export function renderTeamAttack(scores, coverage) {
    const grid = document.getElementById("team-attack-grid");

    if (!grid) return;

    grid.innerHTML = "";

    DISPLAY_TYPES.forEach(type => {
        const value = scores[type];

        const colorClass = value > 0 ? "defence-positive" : "defence-neutral";

        const item = document.createElement("div");

        item.className = "defence-type";
        item.dataset.type = type;
        item.dataset.score = value;

        item.innerHTML = `
      <div class="defence-label ${type}">
        ${formatName(type)}
      </div>

      <div class="defence-value ${colorClass}">
        ${value > 0 ? "+" : ""}${value}
      </div>
    `;

        grid.appendChild(item);
    });

    attachAttackTooltips(coverage);
}

// Update the team attack table
export async function updateTeamAttack() {
    const team = await buildCurrentTeam();
    const { scores, coverage } = calculateTeamOffense(team);
    renderTeamAttack(scores, coverage);
}
