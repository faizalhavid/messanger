import { describe, it, expect, afterEach, beforeEach } from 'bun:test';
import { usersTest, UserTest } from './test-utils';
import { logger } from '@messanger/logging';


describe('POST REGISTER', () => {

    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
    })

    it('should reject register when user request is invalid', async () => {
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser',
                email: 'invalid-email',
                password: 'pAssword123@',
                confirmPassword: 'pAssword123@'
            })
        });

        const body = await response.json();
        logger.debug('Register response:', body);

        expect(response.status).toBe(400);
        expect(body.errors).toBeDefined();
    });

    it('should reject register when user already exists', async () => {
        await UserTest.create(usersTest[0]);
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usersTest[0].username,
                email: usersTest[0].email,
                password: usersTest[0].password,
                confirmPassword: usersTest[0].password
            })
        });

        const body = await response.json();
        logger.debug('Register response:', body);

        expect(response.status).toBe(409);
        expect(body.errors).toBeDefined();
        expect(body.errors).toContain('User already exists');
    });

    it('should register a new user successfully', async () => {
        await UserTest.delete(usersTest[0].username); // Ensure user does not exist before test
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usersTest[0].username,
                email: usersTest[0].email,
                password: usersTest[0].password,
                confirmPassword: usersTest[0].password,
            })
        });
        const body = await response.json();
        logger.debug('Register response:', body);
        expect(response.status).toBe(201);
        expect(body.data).toBeDefined();
        expect(body.data.username).toBe(usersTest[0].username);
        expect(body.data.email).toBe(usersTest[0].email);
        expect(body.data).toHaveProperty('id');
        expect(body.data).toHaveProperty('createdAt');
        expect(body.data).toHaveProperty('updatedAt');
        expect(body.data.password).not.toBe('');
        expect(body.data.password).not.toBeNull();
    });
});

describe('POST LOGIN', () => {

    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
    })

    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
    })

    it('should reject login when user email is invalid', async () => {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'juju',
                email: 'juju@mail.com',
                password: usersTest[0].password
            })
        });

        const body = await response.json();
        logger.debug('Login response:', body);

        expect(response.status).toBe(404);
        expect(body.errors).toBeDefined();
    });

    it('should reject login when user password is invalid', async () => {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usersTest[0].username,
                email: usersTest[0].email,
                password: 'invalid-password'
            })
        });
        const body = await response.json();
        logger.debug('Login response:', body);
        expect(response.status).toBe(401);
        expect(body.errors).toBeDefined();
        expect(body.errors).toContain('Invalid credentials');
    });


    it('should reject login when user does not exist', async () => {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'nonexistentuser',
                email: 'nonexistentuser@example.com',
                password: usersTest[0].password
            })
        });

        const body = await response.json();
        logger.debug('Login response:', body);

        expect(response.status).toBe(404);
        expect(body.errors).toBeDefined();
        expect(body.errors).toContain('User not found');
    });
});
