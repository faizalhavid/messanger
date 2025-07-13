import { prismaClient } from '@messanger/prisma';
import { QueryParamsData, FriendshipList, FriendshipModelMapper, FriendshipRequest, friendshipSchema, PaginatedData, PaginationMeta, UserModelMapper, UserProfile, FriendshipStatusEnum } from '@messanger/types';
import { HTTPException } from 'hono/http-exception';

export class FriendshipService {
  private static friendshipRepository = prismaClient.friendship;
  private static friendshipStatusLogRepository = prismaClient.friendshipStatusLog;
  private static userRepository = prismaClient.user;

  static async createFriendship(req: FriendshipRequest, userId: string): Promise<FriendshipList> {
    const validatedData = friendshipSchema.parse({
      userId,
      friendId: req.friendId,
      status: 'PENDING',
    });
    const friendship = await this.friendshipRepository.create({
      data: {
        userId: validatedData.userId,
        friendId: validatedData.friendId,
        initiatorId: validatedData.userId,
        statusLogs: {
          create: {
            status: validatedData.status,
            changedAt: new Date(),
            changedBy: { connect: { id: validatedData.userId } },
          },
        },
      },
      include: {
        friend: true,
        statusLogs: {
          orderBy: { changedAt: 'desc' },
          take: 1,
        },
      },
    });
    return FriendshipModelMapper.toList({ ...friendship, statusLogs: friendship.statusLogs[0] });
  }

  static async getFriendshipList(userId: string, queryParams: QueryParamsData): Promise<PaginatedData<FriendshipList>> {
    const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 10, search } = queryParams;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {
      userId: userId,
      status: {
        not: 'BLOCKED',
      },
      isActive: true,
      isDeleted: false,
    };

    if (search) {
      where.OR = [{ friend: { username: { contains: search, mode: 'insensitive' } } }, { friend: { email: { contains: search, mode: 'insensitive' } } }];
    }

    const total = await this.friendshipRepository.count({
      where,
    });

    const friendships = await this.friendshipRepository.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        friend: true,
        statusLogs: {
          orderBy: { changedAt: 'desc' },
          take: 1,
        },
      },
    });

    const meta: PaginationMeta = {
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
      page,
      pageSize,
      hasNextPage: skip + take < total,
      hasPreviousPage: skip > 0,
    };

    return {
      items: friendships.map((friend) => FriendshipModelMapper.toList({ ...friend, statusLogs: friend.statusLogs[0] })),
      meta,
    };
  }

  static async getFriendshipById(userId: string, friendId: string): Promise<FriendshipList> {
    const friendship = await this.friendshipRepository.findFirst({
      where: {
        userId,
        friendId,
      },
      include: {
        friend: true,
        statusLogs: {
          orderBy: { changedAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!friendship) throw new Error('Friendship not found');
    return FriendshipModelMapper.toList({
      ...friendship,
      statusLogs: friendship.statusLogs[0],
    });
  }

  static async updateFriendshipStatus(userId: string, friendId: string, status: FriendshipStatusEnum): Promise<FriendshipList> {
    const exitingFriendships = await this.friendshipRepository.findFirst({
      where: {
        userId,
        friendId,
      },
    });

    if (!exitingFriendships) throw new HTTPException(404, { message: 'Friendship not found' });

    const friendship = await this.friendshipStatusLogRepository.create({
      where: {
        unique_friendship_pair: {
          userId,
          friendId,
        },
      },
      data: {
        status,
        changedAt: new Date(),
        changedBy: { connect: { id: userId } },
      },
    });
    return FriendshipModelMapper.toList(friendship);
  }

  static async deleteFriendship(userId: string, friendId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findFirst({
      where: {
        userId,
        friendId,
      },
    });
    if (!friendship) throw new Error('Friendship not found');
    await this.friendshipRepository.delete({
      where: {
        unique_friendship_pair: {
          userId,
          friendId,
        },
      },
    });
  }

  static async findFriendships(queryParams?: QueryParamsData): Promise<PaginatedData<UserProfile>> {
    const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 10, search, ...rest } = queryParams || {};
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const where: any = {
      isActive: true,
      isDeleted: false,
    };
    if (search) {
      where.OR = [{ username: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
    }

    const users = await this.userRepository.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: { profile: true },
    });

    if (!users) throw new HTTPException(404, { message: 'User not found' });

    const total = await this.userRepository.count({ where });

    const meta: PaginationMeta = {
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
      page,
      pageSize,
      hasNextPage: skip + take < total,
      hasPreviousPage: skip > 0,
    };

    return {
      items: users.map((user) => UserModelMapper.fromUserToUserProfile({ ...user, profile: user.profile! })),
      meta,
    };
  }
}
