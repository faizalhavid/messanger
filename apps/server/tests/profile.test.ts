import { describe, it, expect, afterEach, beforeEach } from 'bun:test';
import { ProfileTest, usersTest, UserTest } from './test-utils';


describe('PATCH PROFILE', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await ProfileTest.create({
            userId: usersTest[0].id,
            profile: {
                firstName: 'Test',
                lastName: 'User',
                avatar: 'https://example.com/avatar.jpg'
            }
        });
    })


    it('should rejected if token is not provided', async () => {
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const body = await response.json();
        expect(response.status).toBe(401);
        expect(body.errors).toBeDefined();
        expect(body.errors).toContainAllKeys('Unauthorized');
    });
    it('should rejected if update profile is invalid', async () => {
        const response = await fetch(`http://localhost:3000/api/users/${usersTest[0].id}`, {
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
        const response = await fetch(`http://localhost:3000/api/users/${usersTest[0].id}`, {
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
        expect(body.data.profile.firstName).toBe('John');
        expect(body.data.profile).toBeDefined();
    });

    it('should success if profile is valid (all fields)', async () => {
        const response = await fetch(`http://localhost:3000/api/users/${usersTest[0].id}`, {
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
        console.log('Response status:', response);
        const body = await response.json();
        console.log('Profile update response:', body);
        expect(response.status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.data.profile.firstName).toBe('John');
        expect(body.data.profile.lastName).toBe('Doe');
        expect(body.data.profile).toBeDefined();
    });

    it('should update status activate user profile', async () => {
        const response = await fetch(`http://localhost:3000/api/users/${usersTest[0].id}/activate`, {
            method: 'PATCH',
            headers: {
                'Authorization': usersTest[0].token,
            },
            body: JSON.stringify({
                status: false
            })
        });
        console.log('Activate response status:', response);
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.data).toBeDefined();
        console.log('Activate response:', body);
        expect(body.data.profile).toBeDefined();
        expect(body.data.profile.isActive).toBe(false);
    });

    it('should update status delete user profile', async () => {
        const response = await fetch(`http://localhost:3000/api/users/${usersTest[0].id}/delete`, {
            method: 'PATCH',
            headers: {
                'Authorization': usersTest[0].token,
            },
            body: JSON.stringify({
                status: true
            })
        });
        console.log('Delete response status:', response);
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.data).toBeDefined();
        console.log('Delete response:', body);
        expect(body.data.profile).toBeDefined();
        // expect(body.data.profile.isDeleted).toBe(true);
    });

    afterEach(async () => {
        await ProfileTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[0].username);
    })
});

describe('GET PROFILE', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await ProfileTest.create({
            userId: usersTest[0].id,
            profile: {
                firstName: 'Test',
                lastName: 'User',
                avatar: 'https://example.com/avatar.jpg'
            }
        });
    })

    it('should return profile data', async () => {
        const response = await fetch(`http://localhost:3000/api/users/${usersTest[0].id}`, {
            method: 'GET',
            headers: {
                'Authorization': usersTest[0].token,
            }
        });

        const body = await response.json();
        console.log('Profile response:', body);
        expect(response.status).toBe(200);
        expect(body.data).toBeDefined();
        expect(body.data.profile).toBeDefined();
        expect(body.data.profile.firstName).toBe('Test');
        expect(body.data.profile.lastName).toBe('User');
    });

    it('should return 404 if user not found', async () => {
        const response = await fetch(`http://localhost:3000/api/users/invalid-id`, {
            method: 'GET',
            headers: {
                'Authorization': usersTest[0].token,
            }
        });

        const body = await response.json();
        expect(response.status).toBe(404);
        expect(body.errors).toBeDefined();
        expect(body.errors.message).toBe('User not found');
    });

    afterEach(async () => {
        await ProfileTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[0].username);
    })

});
