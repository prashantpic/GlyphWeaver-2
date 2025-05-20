import { GeneratedLevelData } from '../core/GeneratedLevelData';
import { SolutionPath } from '../core/SolutionPath';
import { IPathfindingAdapter } from '../interfaces/IPathfindingAdapter';
import { GlyphPlacement } from '../core/GlyphPlacement';
import { Point } from '../core/Point';

/**
 * Backend domain service to validate solvability and find solutions.
 * Mirrors C# logic for REQ-CGLE-008, REQ-CGLE-011.
 */
export class SolvabilityValidatorService {

    private getGlyphPairs(glyphPlacements: ReadonlyArray<GlyphPlacement>): Array<[GlyphPlacement, GlyphPlacement]> {
        if (!glyphPlacements || glyphPlacements.length === 0) {
            return [];
        }

        const pairsMap = new Map<number, GlyphPlacement[]>();
        glyphPlacements.forEach(glyph => {
            if (glyph.pairId > 0) {
                if (!pairsMap.has(glyph.pairId)) {
                    pairsMap.set(glyph.pairId, []);
                }
                pairsMap.get(glyph.pairId)!.push(glyph);
            }
        });

        const validPairs: Array<[GlyphPlacement, GlyphPlacement]> = [];
        pairsMap.forEach(glyphsInPair => {
            if (glyphsInPair.length === 2) {
                validPairs.push([glyphsInPair[0], glyphsInPair[1]]);
            }
        });
        return validPairs;
    }

    /**
     * Checks if a level is solvable by finding paths for all glyph pairs.
     * @param levelData The generated level data to validate.
     * @param pathfinder The pathfinding adapter implementation.
     * @returns True if all glyph pairs are solvable, false otherwise.
     */
    public isSolvable(levelData: GeneratedLevelData, pathfinder: IPathfindingAdapter): boolean {
        if (!levelData) throw new Error("GeneratedLevelData is required.");
        if (!pathfinder) throw new Error("IPathfindingAdapter is required.");

        const glyphPairs = this.getGlyphPairs(levelData.glyphPlacements);

        if (glyphPairs.length === 0 && levelData.glyphPlacements.some(gp => gp.pairId > 0)) {
            // Glyphs intended to be pairs exist, but no valid pairs were formed
            return false;
        }
        if (glyphPairs.length === 0) {
            // No pairs to solve, technically solvable (depends on game rules)
            return true;
        }
        
        // Prepare gridData and constraints for the pathfinder adapter.
        // This is an example structure; the actual structure depends on the adapter's needs.
        const gridDataForPathfinder = {
            width: levelData.grid.columns,
            height: levelData.grid.rows,
            obstacles: levelData.obstaclePlacements.map(op => op.position),
            // Pathfinding might also need to know about glyphs if they can be obstacles
            // or if paths cannot pass through other glyphs.
            // glyphs: levelData.glyphPlacements.map(gp => gp.position) 
        };
        const constraintsForPathfinder = {
            // e.g., allowDiagonal: false
        };

        for (const pair of glyphPairs) {
            const path = pathfinder.findPath(
                pair[0].position,
                pair[1].position,
                gridDataForPathfinder, // `any` type as per IPathfindingAdapter definition
                constraintsForPathfinder // `any` type
            );
            if (!path || path.length === 0) {
                return false; // A pair is unsolvable
            }
        }
        return true;
    }

    /**
     * Finds solution paths for all glyph pairs in a level.
     * @param levelData The generated level data.
     * @param pathfinder The pathfinding adapter implementation.
     * @returns An array of SolutionPath objects for each solvable pair. Returns an empty array if no paths are found or no pairs exist.
     */
    public findSolutionPaths(levelData: GeneratedLevelData, pathfinder: IPathfindingAdapter): SolutionPath[] {
        if (!levelData) throw new Error("GeneratedLevelData is required.");
        if (!pathfinder) throw new Error("IPathfindingAdapter is required.");

        const solutions: SolutionPath[] = [];
        const glyphPairs = this.getGlyphPairs(levelData.glyphPlacements);

        if (glyphPairs.length === 0) {
            return solutions; // No pairs to find paths for
        }

        const gridDataForPathfinder = {
            width: levelData.grid.columns,
            height: levelData.grid.rows,
            obstacles: levelData.obstaclePlacements.map(op => op.position),
        };
        const constraintsForPathfinder = { };


        for (const pair of glyphPairs) {
            const pathPoints = pathfinder.findPath(
                pair[0].position,
                pair[1].position,
                gridDataForPathfinder,
                constraintsForPathfinder
            );

            if (pathPoints && pathPoints.length > 0) {
                solutions.push({
                    pathPoints: pathPoints,
                    glyphPairId: pair[0].pairId,
                });
            }
            // Similar to C# version, this method returns paths it *can* find.
            // The caller (Application Service) should handle cases where not all paths are found.
        }
        return solutions;
    }
}