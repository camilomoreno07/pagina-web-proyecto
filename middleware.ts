import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token'); // Obtiene el token de las cookies
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/auth/login', '/auth/register', '/'];

  const publicAuthPaths = ['/auth/login', '/auth/register'];

  if (token) {
    // Si hay un token y el usuario intenta acceder a una ruta pública, redirige a /home
    if (publicPaths.includes(pathname)) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  } else {
    // Si no hay un token y el usuario intenta acceder a una ruta privada, redirige a /auth/login
    if (!publicAuthPaths.includes(pathname)) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Si ninguna condición se cumple, permite el acceso
  return NextResponse.next();
}

// Configuración de las rutas a las que se aplicará el middleware
export const config = {
  matcher: [
    // Se aplica a todas las rutas excepto las específicas de API y recursos estáticos
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
