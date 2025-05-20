export class LevelSeedResponseDTO {
  seed!: string;
  levelParameters!: any; // Parameters used to generate/select this seed
  levelStructure?: any; // Optional: High-level description of the generated level
  puzzleType!: string; // e.g., 'path', 'colorMatch'
}