import { prismaClient } from '@messanger/prisma';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@messanger/types';
import { loginSchema, registerSchema } from '@messanger/types';
import { HTTPException } from 'hono/http-exception';
import { UserModelMapper } from '@messanger/types';
import { Context } from 'hono';
import { exportKey, generateKeyPair } from '@messanger/utils';

export class AuthService {
  private static userRepository = prismaClient.user;

  static async login(req: LoginRequest): Promise<LoginResponse> {
    const validatedLoginData = loginSchema.parse(req);
    let user = await this.userRepository.findFirst({
      where: {
        OR: [{ email: validatedLoginData.email }, { username: validatedLoginData.username }],
      },
    });
    if (!user) {
      throw new HTTPException(404, {
        message: 'User not found',
      });
    }
    const isPasswordValid = await Bun.password.verify(validatedLoginData.password, user.password, 'bcrypt');
    if (!isPasswordValid) {
      throw new HTTPException(401, {
        message: 'Invalid credentials',
      });
    }
    const token = crypto.randomUUID();

    const { publicKey, privateKey } = await generateKeyPair();
    const privateKeyString = await exportKey(privateKey);
    const publicKeyString = await exportKey(publicKey);

    if (!publicKeyString || !privateKeyString) {
      throw new HTTPException(500, {
        message: 'Failed to generate keys',
      });
    }

    user = await this.userRepository.update({
      where: { id: user.id },
      data: { token, pubKey: publicKeyString },
    });

    const response: LoginResponse = {
      token,
      privateKey: privateKeyString,
      user: UserModelMapper.fromUserToUserPublic(user),
    };

    return response;
  }

  static async register(req: RegisterRequest): Promise<RegisterResponse> {
    const validatedRegisterData = registerSchema.parse(req);

    const exists = await this.userRepository.findFirst({
      where: {
        OR: [{ email: validatedRegisterData.email }, { username: validatedRegisterData.username }],
      },
    });
    if (exists) {
      throw new HTTPException(409, { message: 'User already exists' });
    }

    const user = await this.userRepository.create({
      data: {
        username: validatedRegisterData.username!,
        email: validatedRegisterData.email!,
        password: await Bun.password.hash(validatedRegisterData.password, { algorithm: 'bcrypt', cost: 10 }),
      },
    });

    const profile = await prismaClient.profile.create({
      data: {
        userId: user.id,
        firstName: '',
        lastName: '',
        avatar: '',
      },
    });

    const biodata = await prismaClient.biodata.create({
      data: {
        Profile: { connect: { id: profile.id } },
        birthDate: new Date().toISOString(),
        gender: '',
        phone: '',
        address: '',
      },
    });
    return RegisterResponse.fromUserAndProfile(UserModelMapper.fromUserToUserPublic(user), { ...profile, bio: biodata });
  }

  static logout(ctx: Context): string | number {
    return 2;
  }
}
