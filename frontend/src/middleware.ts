import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'am', 'ti', 'or'],

  // Used when no locale matches
  defaultLocale: 'en',
});

// Enhanced middleware with tenant resolution
export default async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract subdomain (tenant identifier)
  const subdomain = extractSubdomain(hostname);

  // Skip tenant resolution for certain paths
  const skipTenantPaths = [
    '/api/health',
    '/api/tenant-provisioning/provision',
    '/_next',
    '/favicon.ico',
    '/public',
  ];

  if (skipTenantPaths.some((path) => pathname.startsWith(path))) {
    return intlMiddleware(request);
  }

  // Handle tenant resolution
  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    // Validate tenant exists and is active
    const tenantValid = await validateTenant(subdomain);

    if (!tenantValid) {
      // Redirect to tenant not found page
      const url = request.nextUrl.clone();
      url.pathname = '/tenant-not-found';
      return NextResponse.redirect(url);
    }

    // Set tenant subdomain cookie for frontend use (not for API calls)
    const response = intlMiddleware(request);
    if (response) {
      response.cookies.set('tenant-subdomain', subdomain, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    return response;
  }

  // No subdomain - redirect to main app or tenant selection
  if (!subdomain || subdomain === 'www') {
    // Check if user is trying to access tenant-specific content
    const tenantSpecificPaths = ['/dashboard', '/projects', '/settings'];
    if (tenantSpecificPaths.some((path) => pathname.startsWith(path))) {
      const url = request.nextUrl.clone();
      url.pathname = '/select-tenant';
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

/**
 * Extract subdomain from hostname
 */
function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];

  // Split by dots
  const parts = host.split('.');

  // For localhost development
  if (host === 'localhost' || host.startsWith('127.0.0.1')) {
    return null;
  }

  // For development with custom hosts (e.g., tenant1.localhost)
  if (host.endsWith('.localhost')) {
    return parts[0];
  }

  // For production domains (e.g., tenant1.example.com)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

/**
 * Validate if tenant exists and is active
 */
async function validateTenant(subdomain: string): Promise<boolean> {
  try {
    // In development, allow any subdomain for testing
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    // Make API call to validate tenant
    const rawBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const cleanedBase = rawBase.replace(/\/$/, '');
    const baseHasApi = /\/api$/.test(cleanedBase);
    const apiRoot = baseHasApi ? cleanedBase : `${cleanedBase}/api`;
    const response = await fetch(`${apiRoot}/tenants/validate/${subdomain}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(5000),
    });

    return response.ok;
  } catch (error) {
    console.error('Error validating tenant:', error);
    // In case of API error, allow access (fail open)
    return true;
  }
}

export const config = {
  // Match all paths except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
