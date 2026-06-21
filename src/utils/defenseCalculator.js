import { TABLE_TYPES, DISPLAY_TYPES } from "./constants.js";

// Calculate how much a specific Pokemon is affected by a type
export function getDefensiveMultiplier(defendingTypes, attackType) {
    let multiplier = 1;

    defendingTypes.forEach(type => {
        multiplier *= (TABLE_TYPES[attackType]?.[type] ?? 1);
    });

    return multiplier;
}

// Convert multipliers into defense points
export function defensiveScore(multiplier) {
    switch (multiplier) {
        case 0:
            return 2;

        case 0.25:
            return 1.5;

        case 0.5:
            return 1;

        case 1:
            return 0;

        case 2:
            return -1;

        case 4:
            return -2;

        default:
            return 0;
    }
}

// Calculate the total defense points for the team
export function calculateTeamDefense(team) {
    const result = {};

    DISPLAY_TYPES.forEach(attackType => {
        let score = 0;

        team.forEach(pokemon => {
            const multiplier = getDefensiveMultiplier(
                pokemon.types,
                attackType
            );

            score += defensiveScore(multiplier);
        });

        result[attackType] = Number(score.toFixed(1));
    });

    return result;
}
