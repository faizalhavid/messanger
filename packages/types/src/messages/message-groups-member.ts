import type { MessageGroupMembers, User } from "@prisma/client";
import { UserPublic } from "../user/user";


export type MessageGroupMembersRequest = {
    messageGroupId: string;
    userId: string;
}

export interface MessageGroupMembersPublic extends Omit<MessageGroupMembers, "updatedAt" | "userId"> {
    user: Omit<UserPublic, "createdAt" | "updatedAt" | "deletedAt" | "isDeleted" | "isActive">;
}

export namespace MessageGroupMembersPublic {
    export function fromPrismaQuery(
        member: MessageGroupMembers & { user: User }
    ): MessageGroupMembersPublic {
        const { id, username, email } = UserPublic.fromUser(member.user);
        return {
            id: member.id,
            createdAt: member.createdAt,
            messageGroupId: member.messageGroupId,
            user: { id, username, email },
            isDeleted: member.isDeleted,
            deletedAt: member.deletedAt,
        };
    }
}