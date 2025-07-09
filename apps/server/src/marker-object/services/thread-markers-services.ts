import { prismaClient } from "@messanger/prisma"
import { MarkerObjectModelMapper, MarkerObjectPublic, MarkerObjectRequest, markObjectSchema, PaginatedData, PaginationMeta, QueryParamsData, ThreadList, ThreadParticipantModelMapper } from "@messanger/types";





export class ThreadMarkersService {

    private static threadRepository = prismaClient.thread;
    private static markerRepository = prismaClient.markObject;


    static async getAllThreadMarkers(threadId: string, userId: string, queryParams: QueryParamsData): Promise<PaginatedData<MarkerObjectPublic<ThreadList>>> {
        const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 10, search, ...rest } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {
            markableType: 'THREAD',
            markableObjectId: threadId,
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
        const existingThread = await this.threadRepository.findUnique({
            where: {
                id: threadId,
            },
            include: {
                participants: {
                    include: {
                        user: {
                            include: {
                                profile: true,
                            }
                        }
                    }
                }
            }
        });
        if (!existingThread) {
            throw new Error('Thread not found');
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

        const threadParticipants = existingThread.participants.map(participant => ({
            ...participant,
            user: participant.user ? { ...participant.user, profile: participant.user.profile ?? undefined } : undefined
        }));

        return {
            items: markers.map(marker =>
                MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic({
                    ...marker,
                    object: {
                        ...existingThread,
                        participants: threadParticipants.map(participant => ThreadParticipantModelMapper.fromThreadParticipantToUserProfileThread(participant))
                    } as ThreadList
                })),
            meta
        }
    }

    static async getThreadMarkerById(markerId: string, threadId: string): Promise<MarkerObjectPublic<ThreadList>> {
        const existingThread = await this.threadRepository.findUnique({
            where: {
                id: threadId,
            },
            include: {
                participants: {
                    include: {
                        user: {
                            include: {
                                profile: true,
                            }
                        }
                    }
                }
            }
        });
        if (!existingThread) {
            throw new Error('Thread not found');
        }

        const marker = await this.markerRepository.findUnique({
            where: {
                id: markerId,
                markableObjectId: threadId,
                markableType: 'THREAD',
            },
        });

        if (!marker) {
            throw new Error('Marker not found');
        }

        const threadParticipants = existingThread.participants.map(participant => ({
            ...participant,
            user: participant.user ? { ...participant.user, profile: participant.user.profile ?? undefined } : undefined
        }));

        return MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic({
            ...marker,
            object: {
                ...existingThread,
                participants: threadParticipants.map(participant => ThreadParticipantModelMapper.fromThreadParticipantToUserProfileThread(participant))
            } as ThreadList
        });
    }
    static async getThreadMarkerByThreadId(threadId: string): Promise<MarkerObjectPublic<ThreadList>[]> {
        const existingThread = await this.threadRepository.findUnique({
            where: {
                id: threadId,
            },
            include: {
                participants: {
                    include: {
                        user: {
                            include: {
                                profile: true,
                            }
                        }
                    }
                }
            }
        });
        if (!existingThread) {
            throw new Error('Thread not found');
        }

        const markers = await this.markerRepository.findMany({
            where: {
                markableObjectId: threadId,
                markableType: 'THREAD',
            },
        });

        if (!markers) {
            throw new Error('Marker not found');
        }


        return markers.map(marker => MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic(marker));
    }



    static async createThreadMarker(req: MarkerObjectRequest, threadId: string, userId: string): Promise<MarkerObjectPublic<ThreadList>> {
        const validated = markObjectSchema.parse(req);
        const existingThread = await this.threadRepository.findUnique({
            where: {
                id: threadId,
            },
            include: {
                participants: {
                    include: {
                        user: {
                            include: {
                                profile: true,
                            }
                        }
                    }
                }
            }
        });
        if (!existingThread) {
            throw new Error('Thread not found');
        }

        const existingMarker = await this.markerRepository.findFirst({
            where: {
                markableType: 'THREAD',
                userId: userId,
                markableObjectId: threadId,
            },
        });
        if (existingMarker) {
            throw new Error('Marker already exists for this thread');
        }
        const newMarker = await this.markerRepository.create({
            data: {
                markableType: validated.markableType,
                userId: userId,
                marker: validated.marker,
                markableObjectId: threadId,
            },
        });

        if (!newMarker) {
            throw new Error('Failed to create marker');
        }

        const threadParticipants = existingThread.participants.map(participant => ({
            ...participant,
            user: participant.user ? { ...participant.user, profile: participant.user.profile ?? undefined } : undefined
        }));

        return MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic({
            ...newMarker,
            object: {
                ...existingThread,
                participants: threadParticipants.map(participant => ThreadParticipantModelMapper.fromThreadParticipantToUserProfileThread(participant))
            } as ThreadList
        });
    }

    static async updateThreadMarker(req: Partial<MarkerObjectRequest>, markerId: string, threadId: string, userId: string): Promise<MarkerObjectPublic<ThreadList>> {
        const validated = markObjectSchema.safeParse(req);

        const existingThread = await this.threadRepository.findUnique({
            where: {
                id: threadId,
            },
            include: {
                participants: {
                    include: {
                        user: {
                            include: {
                                profile: true,
                            }
                        }
                    }
                }
            }
        });
        if (!existingThread) {
            throw new Error('Thread not found');
        }
        const marker = await this.markerRepository.findUnique({
            where: {
                id: markerId,
                markableObjectId: threadId,
                markableType: 'THREAD',
                userId: userId,
            },
        });
        if (!marker) {
            throw new Error('Marker not found');
        }
        const updatedMarker = await this.markerRepository.update({
            where: {
                id: marker.id,
            },
            data: {
                ...validated.data,
            },
        });
        if (!updatedMarker) {
            throw new Error('Failed to update marker');
        }
        const threadParticipants = existingThread.participants.map(participant => ({
            ...participant,
            user: participant.user ? { ...participant.user, profile: participant.user.profile ?? undefined } : undefined
        }));
        return MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic({
            ...updatedMarker,
            object: {
                ...existingThread,
                participants: threadParticipants.map(participant => ThreadParticipantModelMapper.fromThreadParticipantToUserProfileThread(participant))
            } as ThreadList
        });
    }

    static async deleteThreadMarker(markerId: string, threadId: string, userId: string): Promise<void> {
        const existingThread = await this.threadRepository.findUnique({
            where: {
                id: threadId,
            },
            include: {
                participants: {
                    include: {
                        user: {
                            include: {
                                profile: true,
                            }
                        }
                    }
                }
            }
        });
        if (!existingThread) {
            throw new Error('Thread not found');
        }

        const marker = await this.markerRepository.findUnique({
            where: {
                id: markerId,
                markableObjectId: threadId,
                markableType: 'THREAD',
                userId: userId,
            },
        });

        if (!marker) {
            throw new Error('Marker not found');
        }

        await this.markerRepository.update({
            where: {
                id: marker.id,
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
    }




}