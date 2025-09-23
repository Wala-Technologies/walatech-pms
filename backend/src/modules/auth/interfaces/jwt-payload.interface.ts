export interface JwtPayload {
  sub: string; // User ID
  email: string;
  tenant_id?: string; // Optional for backward compatibility
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

export interface JwtPayloadWithTenant extends JwtPayload {
  tenant_id: string; // Required tenant ID
}