import { prismaClient } from "@messanger/prisma";
import { FriendshipList, FriendshipModelMapper, FriendshipPublic, MarkerObjectModelMapper, MarkerObjectPublic, MarkerObjectRequest, markObjectSchema, PaginatedData, PaginationMeta, QueryParamsData } from "@messanger/types";


export class FriendshipMarkersService {
    private static friendshipRepository = prismaClient.friendship;
    private static userRepository = prismaClient.user;
    private static markerRepository = prismaClient.markObject;

    static async getAllFriendshipMarkers(friendshipId: string, userId: string, queryParams: QueryParamsData): Promise<PaginatedData<MarkerObjectPublic<FriendshipList>>> {
        const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 10, search, ...rest } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {
            markableType: 'FRIENDSHIP',
            markableObjectId: friendshipId,
            isDeleted: false,
        };

        if (search) {
            where.marker = {
                contains: search,
                mode: 'insensitive',
            };
        }

        const totalItems = await this.markerRepository.count({
            where: where,
        });

        // userId mean the user who have the friendship with the friend not the friend user id
        const existingFriendship = await this.friendshipRepository.findUnique({
            where: {
                id: friendshipId,
                userId: userId,
            },
        });
        if (!existingFriendship) {
            throw new Error('Friendship not found');
        }

        // friendId mean the id of the friend user

        const friendAccount = await this.userRepository.findUnique({
            where: {
                id: existingFriendship.friendId,
            },
            include: {
                profile: true
            }
        });
        if (!friendAccount) {
            throw new Error('Friend account not found');
        }

        const markers = await this.markerRepository.findMany({
            where,
            skip,
            take,
            orderBy: {
                [sortBy]: sortOrder,
            }
        });

        const meta: PaginationMeta = {
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            page,
            pageSize,
            hasNextPage: skip + take < totalItems,
            hasPreviousPage: skip > 0,
        }

        return {
            items: markers.map(marker => MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic({
                ...marker,
                object: FriendshipModelMapper.toList({
                    ...existingFriendship,
                    friend: {
                        ...friendAccount,
                        profile: friendAccount.profile ?? undefined,
                    }
                })
            }
            )),
            meta
        }
    }

    static async getFriendshipMarkerById(markerId: string, friendshipId: string, userId: string): Promise<MarkerObjectPublic<FriendshipPublic>> {
        const existingFriendship = await this.friendshipRepository.findUnique({
            where: {
                id: friendshipId,
                userId: userId,
            },
        });
        if (!existingFriendship) {
            throw new Error('Friendship not found');
        }

        const marker = await this.markerRepository.findUnique({
            where: {
                id: markerId,
                markableObjectId: friendshipId,
                markableType: 'FRIENDSHIP',
            },
        });

        if (!marker) {
            throw new Error('Marker not found');
        }

        const friendAccount = await this.userRepository.findUnique({
            where: {
                id: existingFriendship.friendId,
            },
        });
        if (!friendAccount) {
            throw new Error('Friend account not found');
        }

        return MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic({
            ...marker,
            object: FriendshipModelMapper.toPublic({
                ...existingFriendship,
                friend: friendAccount
            })
        });
    }

    static async getFriendshipMarkerByFriendshipId(friendshipId: string, userId: string): Promise<MarkerObjectPublic<FriendshipList>[]> {
        const existingFriendship = await this.friendshipRepository.findUnique({
            where: {
                id: friendshipId,
                userId: userId,
            },
        });
        if (!existingFriendship) {
            throw new Error('Friendship not found');
        }

        const markers = await this.markerRepository.findMany({
            where: {
                markableObjectId: friendshipId,
                markableType: 'FRIENDSHIP',
                userId: userId,
            },
        });

        if (!markers) {
            throw new Error('Marker not found');
        }

        const friendAccount = await this.userRepository.findUnique({
            where: {
                id: existingFriendship.friendId,
            },
        });
        if (!friendAccount) {
            throw new Error('Friend account not found');
        }
        return markers.map(marker => MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic(marker));
    }

    static async createFriendshipMarker(req: MarkerObjectRequest, friendshipId: string, userId: string): Promise<MarkerObjectPublic<FriendshipPublic>> {
        const validated = markObjectSchema.parse(req);

        const existingFriendship = await this.friendshipRepository.findUnique({
            where: {
                id: friendshipId,
                userId: userId,
            },
        });
        if (!existingFriendship) {
            throw new Error('Friendship not found');
        }

        const friendAccount = await this.userRepository.findUnique({
            where: {
                id: existingFriendship.friendId,
            },
        });
        if (!friendAccount) {
            throw new Error('Friend account not found');
        }

        const existingMarker = await this.markerRepository.findFirst({
            where: {
                markableType: 'FRIENDSHIP',
                markableObjectId: friendshipId,
                userId: userId,
            },
        });

        if (existingMarker) {
            throw new Error('Marker already exists for this conversation');
        }

        const newMarker = await this.markerRepository.create({
            data: {
                markableType: validated.markableType,
                userId: userId,
                marker: validated.marker,
                markableObjectId: friendshipId,
            },
        });



        return MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic({
            ...newMarker,
            object: FriendshipModelMapper.toPublic({
                ...existingFriendship,
                friend: friendAccount
            })
        });
    }

    static async updateFriendshipMarker(req: MarkerObjectRequest, markerId: string, friendshipId: string, userId: string,): Promise<MarkerObjectPublic<FriendshipPublic>> {
        const validated = markObjectSchema.safeParse(req);
        const existingFriendship = await this.friendshipRepository.findUnique({
            where: {
                id: friendshipId,
                userId: userId,
            },
        });
        if (!existingFriendship) {
            throw new Error('Friendship not found');
        }
        const marker = await this.markerRepository.findUnique({
            where: {
                id: markerId,
                markableObjectId: friendshipId,
                markableType: 'FRIENDSHIP',
            },
        });
        if (!marker) {
            throw new Error('Marker not found');
        }
        const updatedMarker = await this.markerRepository.update({
            where: {
                id: markerId,
            },
            data: {
                ...validated.data,
            },
        });
        const friendAccount = await this.userRepository.findUnique({
            where: {
                id: existingFriendship.friendId,
            },
        });
        if (!friendAccount) {
            throw new Error('Friend account not found');
        }
        return MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic({
            ...updatedMarker,
            object: FriendshipModelMapper.toPublic({
                ...existingFriendship,
                friend: friendAccount
            })
        });
    }

    static async deleteFriendshipMarker(markerId: string, friendshipId: string, userId: string): Promise<void> {
        const existingFriendship = await this.friendshipRepository.findUnique({
            where: {
                id: friendshipId,
                userId: userId,
            },
        });
        if (!existingFriendship) {
            throw new Error('Friendship not found');
        }

        const marker = await this.markerRepository.findUnique({
            where: {
                id: markerId,
                markableObjectId: friendshipId,
                markableType: 'FRIENDSHIP',
            },
        });

        if (!marker) {
            throw new Error('Marker not found');
        }

        await this.markerRepository.update({
            where: {
                id: markerId,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }





}