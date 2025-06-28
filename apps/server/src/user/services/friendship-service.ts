import { prismaClient } from '@messanger/prisma';
import { QueryParamsData, FriendshipList, FriendshipModelMapper, FriendshipRequest, friendshipSchema, PaginatedData, PaginationMeta } from '@messanger/types';

export class FriendshipService {
  private static friendshipRepository = prismaClient.friendship;
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
        status: validatedData.status,
      },
      include: {
        friend: true,
      },
    });
    return FriendshipModelMapper.toList(friendship);
  }

  static async getFriendshipList(userId: string, queryParams: QueryParamsData): Promise<PaginatedData<FriendshipList>> {
    const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 10, search } = queryParams;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {
      userId: userId,
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
      items: friendships.map(FriendshipModelMapper.toList),
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
      },
    });
    if (!friendship) throw new Error('Friendship not found');
    return FriendshipModelMapper.toList(friendship);
  }

  static async updateFriendshipStatus(userId: string, friendId: string, status: 'PENDING' | 'ACCEPTED' | 'BLOCKED' | 'DECLINED'): Promise<FriendshipList> {
    const friendship = await this.friendshipRepository.update({
      where: {
        unique_friendship_pair: {
          userId,
          friendId,
        },
      },
      data: {
        status,
      },
      include: {
        friend: true,
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
}
