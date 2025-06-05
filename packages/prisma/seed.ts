import { PrismaClient } from "@prisma/client";



// const prisma = new PrismaClient();
// async function main() {
//     const testUser = await prisma.user.create({
//         data: {
//             username: "testuser",
//             email: "johndoe@mail.com",
//             password: await Bun.password.hash("pAssword123@", { algorithm: "bcrypt", cost: 10 }),
//         }
//     });

//     console.log("Test user created:", testUser);
// }

// main().then(async () => {
//     await prisma.$disconnect();
// }).catch(async (e) => {
//     console.error("Error creating test user:", e);
//     await prisma.$disconnect();
// });