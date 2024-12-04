// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token'); // O usa localStorage, pero mejor cookies para seguridad

  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/auth/login', '/auth/register'];

  // Redirigir a login si no hay token y está intentando acceder a una ruta privada
  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Permitir el acceso a las rutas
  return NextResponse.next();
}

// Configuración de las rutas a las que se aplicará el middleware
export const config = {
  matcher: [
    // Se aplica a todas las rutas, ajusta según sea necesario
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
