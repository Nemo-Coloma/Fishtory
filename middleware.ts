import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const isGet = request.method === 'GET'
    const isServerAction = request.headers.has('next-action')

    if (isGet && !isServerAction) {
      const role = user?.user_metadata?.role

      // Protect /staff/* — only 'staff' role allowed
      if (
        request.nextUrl.pathname.startsWith('/staff') &&
        !request.nextUrl.pathname.startsWith('/staff/login')
      ) {
        if (!user) {
          return NextResponse.redirect(new URL('/staff/login', request.url))
        }
        if (role !== 'staff') {
          if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
          return NextResponse.redirect(new URL('/staff/login', request.url))
        }
      }

      // Protect /admin — only 'admin' role allowed
      if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user || role !== 'admin') {
          return NextResponse.redirect(new URL('/login?role=admin', request.url))
        }
      }

      // Protect /dashboard and /complete-profile — fishermen only
      if (
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/complete-profile')
      ) {
        if (!user) {
          return NextResponse.redirect(new URL('/login', request.url))
        }
        if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
        if (role === 'staff') return NextResponse.redirect(new URL('/staff/dashboard', request.url))
      }
    }
  } catch (error) {
    // If Supabase auth fails (e.g. network issue), let the request through
    // rather than crashing with MIDDLEWARE_INVOCATION_FAILED
    console.error('[middleware] auth error:', error)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
