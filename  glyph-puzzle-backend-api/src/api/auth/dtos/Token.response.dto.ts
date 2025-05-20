export class TokenResponseDTO {
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number; // Expiry time for the access token in seconds
}