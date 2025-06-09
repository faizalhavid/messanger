import type { ConversationGroupMembers, User } from "@prisma/client";
import { UserPublic } from "../user/user";


export type ConversationGroupMembersRequest = {
    messageGroupId: string;
    userId: string;
}

export interface MessageGroupMembersPublic extends Omit<ConversationGroupMembers, "updatedAt" | "userId"> {
    user: Omit<UserPublic, "createdAt" | "updatedAt" | "deletedAt" | "isDeleted" | "isActive">;
}

export namespace MessageGroupMembersPublic {
    export function fromPrismaQuery(
        member: ConversationGroupMembers & { user: User }
    ): MessageGroupMembersPublic {
        const { id, username, email } = UserPublic.fromUser(member.user);
        return {
            id: member.id,
            createdAt: member.createdAt,
            groupId: member.groupId,
            user: { id, username, email },
            isDeleted: member.isDeleted,
            deletedAt: member.deletedAt,
        };
    }
}