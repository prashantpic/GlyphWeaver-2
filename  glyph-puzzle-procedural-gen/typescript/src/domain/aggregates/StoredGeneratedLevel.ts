import { LevelIdentifier } from '../core/LevelIdentifier';
import { LevelSeed } from '../core/LevelSeed';
import { GenerationParameters } from '../core/GenerationParameters';
import { SolutionPath } from '../core/SolutionPath';

/**
 * Aggregate root representing the persisted data for a procedurally generated level.
 * Includes seed, parameters, and solution. For REQ-CGLE-011.
 */
export class StoredGeneratedLevel {
    private readonly _levelId: LevelIdentifier;
    private readonly _seed: LevelSeed;
    private readonly _parameters: GenerationParameters;
    private readonly _solutions: SolutionPath[];
    private readonly _createdAt: Date;
    private _version: number; // Can be mutated if versioning strategy requires updates

    private constructor(
        levelId: LevelIdentifier,
        seed: LevelSeed,
        parameters: GenerationParameters,
        solutions: SolutionPath[],
        createdAt: Date,
        version: number
    ) {
        this._levelId = levelId;
        this._seed = seed;
        this._parameters = parameters;
        this._solutions = [...solutions]; // Ensure immutability of the passed array
        this._createdAt = createdAt;
        this._version = version;
    }

    /**
     * Factory method to create a new StoredGeneratedLevel instance.
     * @param levelId Unique identifier for the level.
     * @param seed The seed used for generation.
     * @param parameters The parameters used for generation.
     * @param solutions The verified solution paths for the level.
     * @returns A new instance of StoredGeneratedLevel.
     */
    public static create(
        levelId: LevelIdentifier,
        seed: LevelSeed,
        parameters: GenerationParameters,
        solutions: SolutionPath[]
    ): StoredGeneratedLevel {
        // Add any validation logic for parameters here if needed before creation
        if (!levelId) throw new Error("Level ID is required.");
        if (!seed) throw new Error("Seed is required.");
        if (!parameters) throw new Error("Generation parameters are required.");
        if (!solutions) throw new Error("Solutions are required (can be an empty array if applicable).");
        
        return new StoredGeneratedLevel(
            levelId,
            seed,
            parameters,
            solutions,
            new Date(), // createdAt is set on creation
            1             // Initial version
        );
    }

    public get levelId(): LevelIdentifier {
        return this._levelId;
    }

    public get seed(): LevelSeed {
        return this._seed;
    }

    public get parameters(): GenerationParameters {
        // Return a deep copy if parameters object is mutable and needs protection
        return { ...this._parameters };
    }

    public get solutions(): ReadonlyArray<SolutionPath> {
        // Return a shallow copy to prevent external modification of the internal array
        return [...this._solutions];
    }

    public get createdAt(): Date {
        return new Date(this._createdAt.getTime()); // Return a copy
    }

    public get version(): number {
        return this._version;
    }
    
    // Example method if versioning is used for optimistic concurrency
    public incrementVersion(): void {
        this._version += 1;
    }
}