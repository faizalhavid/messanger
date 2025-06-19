import { HTTPException } from 'hono/http-exception';
import { Context } from 'hono';
import { UserService } from './user/services/user-service';

const publicRoutes = ['/api/auth', '/api/seed', '/api/clear'];

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
    console.log('Auth middleware triggered for path:', c.req.path);
    const token = c.req.header('Authorization');
    const currentPath = c.req.path;
    const isPublicRoute = publicRoutes.some(route => currentPath.includes(route));
    if (!isPublicRoute && !token) {
        throw new HTTPException(401, { message: 'Unauthorized: Token is required for this route' });
    }
    if (!isPublicRoute && token) {
        const authenticatedUser = await UserService.getUserByToken(token);
        c.set('authenticatedUser', authenticatedUser);
        console.log('Authenticated user:', authenticatedUser);
    }
    return next();
};