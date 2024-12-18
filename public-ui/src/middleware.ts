import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    if (path.startsWith('/dashboard')) {
        return NextResponse.rewrite(new URL('http://localhost:3001' + path))
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/dashboard/:path*'
} 