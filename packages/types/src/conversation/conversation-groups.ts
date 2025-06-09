import type { ConversationGroup, User, ConversationGroupMembers, Conversation } from "@prisma/client";
import { UserPublic } from "../user/user";
import { ConversationPublic } from "./conversation";
import { MessageGroupMembersPublic } from "./conversation-groups-member";


export type ConversationGroupRequest = {
    name: string;
    description?: string;
    isPublic?: boolean;
    members: string[];
}

type MemberUserType = Omit<UserPublic, "createdAt" | "updatedAt" | "deletedAt" | "isDeleted" | "isActive">;
type LastConversation = Omit<ConversationPublic, "receiver" | "sender"> & {
    sender?: MemberUserType;
}

export interface ConversationGroupsPublic extends Omit<ConversationGroup, "updatedAt" | "ownerId"> {
    owner: MemberUserType;
    membersCount: number;
    members: MessageGroupMembersPublic[];
    lastMessage?: LastConversation;
}

export namespace ConversationGroupsPublic {
    export function fromPrismaToConversationGroupPublic(
        group: ConversationGroup & {
            owner: User;
            members: (ConversationGroupMembers & { user: User })[];
            lastConversation?: Conversation & { sender?: User };
        }
    ): ConversationGroupsPublic {
        const toMemberUserType = (user: User): MemberUserType => {
            const { id, username, email } = UserPublic.fromUser(user);
            return { id, username, email };
        };
        const toLastConversation = (conversation?: Conversation, sender?: User): LastConversation | undefined => {
            if (!conversation) return undefined;
            return {
                id: conversation.id,
                content: conversation.content,
                createdAt: conversation.createdAt,
                isDeletedBySender: conversation.isDeletedBySender ?? false,
                isDeletedByReceiver: conversation.isDeletedByReceiver ?? false,
                sender: sender ? toMemberUserType(sender) : undefined
            };
        }
        return {
            id: group.id,
            name: group.name,
            createdAt: group.createdAt,
            isPublic: group.isPublic,
            description: group.description,
            avatar: group.avatar,
            deletedAt: group.deletedAt,
            isDeleted: group.isDeleted,
            membersCount: group.members.length,
            owner: toMemberUserType(group.owner),
            members: group.members.map(member => ({
                ...MessageGroupMembersPublic.fromPrismaQuery(member),
                user: toMemberUserType(member.user)
            })),
            lastMessage: toLastConversation(group.lastConversation, group.lastConversation?.sender)
        };
    }
}