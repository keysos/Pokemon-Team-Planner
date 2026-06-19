import { DISPLAY_TYPES } from "../utils/constants.js";
import { calculateTeamDefense } from "../utils/defenseCalculator.js";
import { buildCurrentTeam } from "./pokemonSelects.js";
import { formatName } from "../utils/helpers.js";

// Render the team defense table
export function renderTeamDefense(defense) {
    const grid = document.getElementById("team-defence-grid");

    if (!grid) return;

    grid.innerHTML = "";

    DISPLAY_TYPES.forEach(type => {
        const value = defense[type];

        let colorClass = "defence-neutral";

        if (value > 0)
            colorClass = "defence-positive";

        if (value < 0)
            colorClass = "defence-negative";

        const item = document.createElement("div");

        item.className = "defence-type";

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
}

// Update the team defense table
export async function updateTeamDefense() {
    const team = await buildCurrentTeam();
    const defense = calculateTeamDefense(team);
    renderTeamDefense(defense);
}
