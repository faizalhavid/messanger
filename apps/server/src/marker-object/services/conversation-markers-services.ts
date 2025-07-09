import { prismaClient } from "@messanger/prisma";
import { ConversationModelMapper, ConversationPublic, MarkerObjectModelMapper, MarkerObjectPublic, MarkerObjectRequest, markObjectSchema, PaginatedData, PaginationMeta, QueryParamsData } from "@messanger/types";
import { Conversation, MarkObject } from "@prisma/client";

export class ConversationMarkersService {
    private static conversationRepository = prismaClient.conversation;
    private static markerRepository = prismaClient.markObject;


    static async getAllConversationMarkers(threadId: string, conversationId: string, queryParams: QueryParamsData): Promise<PaginatedData<MarkerObjectPublic<ConversationPublic>>> {
        const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, pageSize = 10, search, ...rest } = queryParams;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where: any = {
            markableType: 'CONVERSATION',
            markableObjectId: conversationId,
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

        const existingConversation = await this.conversationRepository.findUnique({
            where: {
                id: conversationId,
                threadId: threadId,
            },
        });
        if (!existingConversation) {
            throw new Error('Conversation not found');
        }

        const markers = await this.markerRepository.findMany({
            where,
            skip,
            take,
            orderBy: {
                [sortBy]: sortOrder,
            },
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
                object: ConversationModelMapper.fromConversationToConversationPublic(existingConversation)
            })),
            meta
        }

    }

    static async getConversationMarkerById(markerId: string, conversationId: string, threadId: string, userId: string): Promise<MarkerObjectPublic<ConversationPublic>> {
        const marker = await this.markerRepository.findUnique({
            where: {
                id: markerId,
                markableType: 'CONVERSATION',
                userId: userId,
                markableObjectId: conversationId,
            },
        });

        if (!marker) {
            throw new Error('Marker not found');
        }

        const existingConversation = await this.conversationRepository.findUnique({
            where: {
                id: marker.markableObjectId,
                threadId: threadId,
            },
        });
        if (!existingConversation) {
            throw new Error('Conversation not found');
        }


        return MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic({
            ...marker,
            object: ConversationModelMapper.fromConversationToConversationPublic(existingConversation)
        });
    }

    static async getConversationMarkersByConversationId(conversationId: string, threadId: string, userId: string): Promise<MarkerObjectPublic<ConversationPublic>[]> {
        const existingConversation = await this.conversationRepository.findUnique({
            where: {
                id: conversationId,
                threadId: threadId,
            },
        });
        if (!existingConversation) {
            throw new Error('Conversation not found');
        }

        const markers = await this.markerRepository.findMany({

            where: {
                markableType: 'CONVERSATION',
                markableObjectId: conversationId,
                userId: userId,
            },
        });

        return markers.map(marker => MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic(marker));
    }

    static async createConversationMarker(req: MarkerObjectRequest, threadId: string, conversationId: string, userId: string): Promise<MarkerObjectPublic<ConversationPublic>> {
        const validated = markObjectSchema.parse(req);

        const exitingConversation = await this.conversationRepository.findUnique({
            where: {
                id: conversationId,
                threadId: threadId,
            },
        });
        if (!exitingConversation) {
            throw new Error('Conversation not found');
        }
        const existingMarker = await this.markerRepository.findFirst({
            where: {
                markableType: validated.markableType,
                userId: userId,
                marker: validated.marker,
                markableObjectId: conversationId,
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
                markableObjectId: conversationId,
            },
        });

        return MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic({
            ...newMarker,
            object: ConversationModelMapper.fromConversationToConversationPublic(exitingConversation)
        });
    }

    static async updateConversationMarker(req: Partial<MarkerObjectRequest>, markerId: string, threadId: string, conversationId: string, userId: string): Promise<MarkerObjectPublic<ConversationPublic>> {
        // const validated = markObjectSchema.partial().parse(req);
        const validated = markObjectSchema.safeParse(req);
        const existingConversation = await this.conversationRepository.findUnique({
            where: {
                id: conversationId,
                threadId: threadId,
            },
        });
        if (!existingConversation) {
            throw new Error('Conversation not found');
        }

        const marker = await this.markerRepository.findUnique({
            where: {
                id: markerId,
                markableObjectId: conversationId,
                markableType: 'CONVERSATION',
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
            data: { ...validated.data },
        });

        return MarkerObjectModelMapper.fromMarkerObjectToMarkerObjectPublic({
            ...updatedMarker,
            object: ConversationModelMapper.fromConversationToConversationPublic(existingConversation)
        });
    }


    static async deleteConversationMarker(markerId: string, threadId: string, conversationId: string, userId: string): Promise<void> {
        const existingConversation = await this.conversationRepository.findUnique({
            where: {
                id: conversationId,
                threadId: threadId,
            },
        });
        if (!existingConversation) {
            throw new Error('Conversation not found');
        }

        const marker = await this.markerRepository.findUnique({
            where: {
                id: markerId,
                markableObjectId: conversationId,
                markableType: 'CONVERSATION',
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