/**
 * Represents the configuration and rules for a specific leaderboard.
 * This class models a leaderboard's properties, such as its name,
 * scope, reset frequency, and tie-breaking rules.
 */
export class Leaderboard {
    public readonly id: string;
    public readonly name: string;
    public readonly scope: 'global' | 'event';
    public readonly resetCycle: 'daily' | 'weekly' | 'none';
    public readonly tieBreakingFields: string[];

    constructor(
        id: string,
        name: string,
        scope: 'global' | 'event',
        resetCycle: 'daily' | 'weekly' | 'none',
        tieBreakingFields: string[]
    ) {
        this.id = id;
        this.name = name;
        this.scope = scope;
        this.resetCycle = resetCycle;
        this.tieBreakingFields = tieBreakingFields;
    }
}