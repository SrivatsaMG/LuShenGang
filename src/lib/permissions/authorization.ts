import { getDiscordGuildMember } from "@/lib/discord/client";

export type AccessLevel = "owner" | "leader" | "management" | "member" | "visitor";
export type Permission = "dashboard:read" | "community:manage";

const roleEnvironmentKeys: Record<Exclude<AccessLevel, "visitor">, string> = {
  owner: "DISCORD_OWNER_ROLE_ID",
  leader: "DISCORD_LEADER_ROLE_ID",
  management: "DISCORD_MANAGEMENT_ROLE_ID",
  member: "DISCORD_MEMBER_ROLE_ID",
};

const rolePriority: Array<Exclude<AccessLevel, "visitor">> = ["owner", "leader", "management", "member"];
const permissionsByLevel: Record<AccessLevel, Permission[]> = {
  owner: ["dashboard:read", "community:manage"],
  leader: ["dashboard:read", "community:manage"],
  management: ["dashboard:read", "community:manage"],
  member: [],
  visitor: [],
};

export interface AuthorizationResult {
  isGuildMember: boolean;
  accessLevel: AccessLevel;
  permissions: Permission[];
}

export async function getAuthorizationForUser(userId: string): Promise<AuthorizationResult> {
  const member = await getDiscordGuildMember(userId);
  if (!member) {
    return { isGuildMember: false, accessLevel: "visitor", permissions: [] };
  }

  const accessLevel = rolePriority.find((level) => {
    const roleId = process.env[roleEnvironmentKeys[level]];
    return roleId !== undefined && roleId.length > 0 && member.roles.includes(roleId);
  }) ?? "visitor";

  return {
    isGuildMember: true,
    accessLevel,
    permissions: permissionsByLevel[accessLevel],
  };
}

export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const authorization = await getAuthorizationForUser(userId);
  return authorization.permissions.includes(permission);
}
