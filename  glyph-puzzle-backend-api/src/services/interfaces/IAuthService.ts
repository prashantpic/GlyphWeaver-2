import { LoginRequestDTO } from '../../api/auth/dtos/Login.request.dto';
import { RefreshTokenRequestDTO } from '../../api/auth/dtos/RefreshToken.request.dto';
import { TokenResponseDTO } from '../../api/auth/dtos/Token.response.dto';

export interface IAuthService {
  /**
   * Authenticates a player and returns access and refresh tokens.
   * @param loginRequestDto - DTO containing login credentials.
   * @returns A promise that resolves to a TokenResponseDTO.
   */
  login(loginRequestDto: LoginRequestDTO): Promise<TokenResponseDTO>;

  /**
   * Refreshes an access token using a valid refresh token.
   * @param refreshTokenRequestDto - DTO containing the refresh token.
   * @returns A promise that resolves to a new TokenResponseDTO.
   */
  refreshTokens(refreshTokenRequestDto: RefreshTokenRequestDTO): Promise<TokenResponseDTO>;
}