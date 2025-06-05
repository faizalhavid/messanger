import { describe, it, expect, afterEach, beforeEach } from 'bun:test';
import { ProfileTest, usersTest, UserTest } from './test-utils';
import { logger } from '@/core/logging';


describe('PATCH PROFILE', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await ProfileTest.create(usersTest[0]);
    })


    it('should rejected if token is not provided', async () => {
        const response = await fetch('http://localhost:3000/profile', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const body = await response.json();
        expect(response.status).toBe(401);
        expect(body.errors).toBeDefined();
        //expect(body.errors).toContainAllKeys('Unauthorized');
    });
    it('should rejected if update profile is invalid', async () => {
        const response = await fetch('http://localhost:3000/profile', {
            method: 'PATCH',
            headers: {
                'Authorization': usersTest[0].token,
            },
            body: JSON.stringify({
                firstName: ''
            })
        });

        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body.errors).toBeDefined();
        //expect(body.errors).toContain('Invalid input');
    });

    it('should success if profile is valid (only firstname)', async () => {
        const response = await fetch('http://localhost:3000/profile', {
            method: 'PATCH',
            headers: {
                'Authorization': usersTest[0].token,
            },
            body: JSON.stringify({
                firstName: 'John'
            })
        });
        const body = await response.json();
        console.log('Profile update response:', body);
        expect(response.status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.data.firstName).toBe('John');
        expect(body.data.user).toBeDefined();
    });

    it('should success if profile is valid (all fields)', async () => {
        const response = await fetch('http://localhost:3000/profile', {
            method: 'PATCH',
            headers: {
                'Authorization': usersTest[0].token,
            },
            body: JSON.stringify({
                firstName: 'John',
                lastName: 'Doe',
                // avatar: 'https://example.com/avatar.jpg'
            })
        });
        const body = await response.json();
        console.log('Profile update response:', body);
        expect(response.status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.data.firstName).toBe('John');
        expect(body.data.lastName).toBe('Doe');
        expect(body.data.user).toBeDefined();
    });


    afterEach(async () => {
        await ProfileTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[0].username);
    })
});

describe('GET PROFILE', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await ProfileTest.create(usersTest[0]);
    })

    it('should return profile data', async () => {
        const response = await fetch('http://localhost:3000/profile', {
            method: 'GET',
            headers: {
                'Authorization': usersTest[0].token,
            }
        });

        const body = await response.json();
        console.log('Profile response:', body);
        expect(response.status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.data.firstName).toBe('Test');
        expect(body.data.lastName).toBe('User');
        expect(body.data.user).toBeDefined();
    });

    afterEach(async () => {
        await ProfileTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[0].username);
    })

});
