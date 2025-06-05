import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { generateWSData, usersTest, UserTest } from "./test-utils";
import { WsEventName } from "@/core/types/websocket";


describe('Message WebSocket Controller', () => {
    beforeEach(async () => {
        await UserTest.create(usersTest[0]);
        await UserTest.create(usersTest[1]);
    })

    it('should reject connection without Authorization token', async () => {
        await new Promise<void>((resolve, reject) => {
            const ws = new WebSocket('ws://localhost:3000/ws?topic=messages');
            const data = generateWSData(WsEventName.MessageCreated, { "messsage": "halo im unauth user" });
            ws.onopen = () => {
                console.log('WebSocket connection opened');
                ws.send(JSON.stringify(data));
            };
            ws.onerror = () => {
                resolve();
            };
            ws.onclose = (event) => {
                expect(event.code).toBe(4001);
                resolve();
            };
        });
    });

    it('should reject connection with invalid token', async () => {
        await new Promise<void>((resolve, reject) => {
            const ws = new WebSocket('ws://localhost:3000/ws?topic=messages');
            const data = generateWSData(WsEventName.Authentication, { "token": "invalid-token" });
            ws.onopen = () => {
                console.log('WebSocket connection opened');
                ws.send(JSON.stringify(data));
            };
            ws.onmessage = (event) => {
                ws.send(JSON.stringify(data));
                console.log('WebSocket message received:', event.data);
            };
            ws.onclose = (event) => {
                try {
                    expect(event.code).toBe(4002);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            ws.onerror = (err) => {
                // Biarkan onclose yang resolve
            };
            setTimeout(() => reject(new Error('Timeout: ws.onclose not called')), 2000);
        });
    });

    it('should reject connection with invalid topic', async () => {
        await new Promise<void>((resolve, reject) => {
            const ws = new WebSocket('ws://localhost:3000/ws?topic=invalid');
            const data = generateWSData(WsEventName.Authentication, { "token": usersTest[0].token });
            ws.onopen = () => {
                console.log('WebSocket connection opened');
            };
            ws.onmessage = (event) => {
                ws.send(JSON.stringify(data));
                console.log('WebSocket message received:', event.data);
            }
            ws.onerror = () => {
                resolve();
            };
            ws.onclose = (event) => {
                expect(event.code).toBe(4000); // Invalid topic
                resolve();
            };
        });
    });

    it('should handle WebSocket connections', async () => {
        await new Promise<void>((resolve, reject) => {
            const ws = new WebSocket('ws://localhost:3000/ws');
            ws.onopen = () => {
                console.log('WebSocket connection established');
                expect(ws.readyState).toBe(WebSocket.OPEN);
                ws.close();
                resolve();
            };
            ws.onerror = (error) => {
                reject(error);
            };
        });
    });

    // it('should broadcast messages to all clients', async () => {
    //     await new Promise<void>((resolve, reject) => {
    //         const ws1 = new WebSocket('ws://localhost:3000/ws?topic=messages');
    //         const ws2 = new WebSocket('ws://localhost:3000/ws?topic=messages');
    //         const auth1 = generateWSData(WsEventName.Authentication, { token: usersTest[0].token });
    //         const auth2 = generateWSData(WsEventName.Authentication, { token: usersTest[1].token });

    //         let ready = 0;
    //         ws1.onopen = () => ws1.send(JSON.stringify(auth1));
    //         ws2.onopen = () => ws2.send(JSON.stringify(auth2));

    //         ws2.onmessage = (event) => {
    //             const data = JSON.parse(event.data);
    //             if (data.event === 'auth-success') {
    //                 // Tunggu ws1 juga auth, lalu ws1 kirim pesan
    //                 ready++;
    //                 if (ready === 2) {
    //                     ws1.send(JSON.stringify({ event: "message", data: { content: "Hello from ws1" } }));
    //                 }
    //             } else if (data.data?.content === "Hello from ws1") {
    //                 expect(data.data.content).toBe("Hello from ws1");
    //                 ws1.close();
    //                 ws2.close();
    //                 resolve();
    //             }
    //         };
    //         ws1.onmessage = (event) => {
    //             const data = JSON.parse(event.data);
    //             if (data.event === 'auth-success') {
    //                 ready++;
    //                 if (ready === 2) {
    //                     ws1.send(JSON.stringify({ event: "message", data: { content: "Hello from ws1" } }));
    //                 }
    //             }
    //         };
    //         setTimeout(() => {
    //             ws1.close();
    //             ws2.close();
    //             reject(new Error('Timeout'));
    //         }, 2000);
    //     });
    // });

    it('should receive MessageCreated event after posting message via API', async () => {
        await new Promise<void>(async (resolve, reject) => {
            const ws = new WebSocket('ws://localhost:3000/ws?topic=messages');
            const authData = generateWSData(WsEventName.Authentication, { "token": usersTest[0].token });

            let timeout = setTimeout(() => {
                ws.close();
                reject(new Error('Timeout: did not receive expected message'));
            }, 3000);

            ws.onopen = () => {
                ws.send(JSON.stringify(authData));
            };

            ws.onmessage = async (event) => {
                const response = JSON.parse(event.data);
                if (response.event === 'auth-success') {
                    // simulate sending a message via API
                    const response = await fetch('http://localhost:3000/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': usersTest[0].token
                        },
                        body: JSON.stringify({
                            content: 'Hello, this is a test message!',
                            receiverId: usersTest[1].id
                        })
                    });
                    console.log('Post message response status:', response);
                    const body = await response.json();
                    console.log('Post message response:', body);

                    expect(response.status).toBe(200);
                    //expect(body.success).toBe(true);
                    expect(body.data).toBeDefined();
                    //expect(body.data.content).toBe('Hello, this is a test message!');


                } else if (response.event === WsEventName.MessageCreated) {
                    expect(response.data.content).toBe("Hello, this is a test message!");
                    clearTimeout(timeout);
                    ws.close();
                    resolve();
                }
            };

            ws.onerror = (error) => {
                clearTimeout(timeout);
                ws.close();
                reject(error);
            };
        });
    });

    afterEach(async () => {
        await UserTest.delete(usersTest[0].username);
        await UserTest.delete(usersTest[1].username);
    });
});
