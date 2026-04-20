export interface PreDelegationResult {
  assetName: string;
  assetType: string;
  assetId: string;
  currentOwnerName: string;
  currentOwnerId: string;
  currentOwnerType: "user" | "team";
  reason: "DELETED_USER" | "ADMIN_OWNER" | "SINGLE_USER_OWNER";
  reassignTo: {
    id: string;
    name: string;
    type: "user" | "team";
  };
  description: string;
  comments: string;
  status: "PENDING" | "DONE" | "FAILED";
}

export function evaluatePreDelegation(
  assets: { data: any[]; type: string }[],
  ownerStatuses: Map<string, any>,
  defaultTeam: { id: string; name: string }
): PreDelegationResult[] {
  const results: PreDelegationResult[] = [];

  for (const { data, type } of assets) {
    for (const asset of data) {
      const owners = asset.owners || [];
      if (owners.length === 0) continue;

      for (const owner of owners) {
        const ownerStatus = ownerStatuses.get(owner.id);

        // Case 1: Owner is a deleted user
        if (owner.type === "user" && ownerStatus?.deleted === true) {
          results.push({
            assetName: asset.name,
            assetType: type,
            assetId: asset.id,
            currentOwnerName: owner.name,
            currentOwnerId: owner.id,
            currentOwnerType: "user",
            reason: "DELETED_USER",
            reassignTo: {
              id: defaultTeam.id,
              name: defaultTeam.name,
              type: "team",
            },
            description: `Owner ${owner.name} is deleted. Pre-delegating to ${defaultTeam.name}.`,
            comments: `Auto pre-delegated by PolicyGuard — deleted user detected. SailPoint IIQ pattern applied.`,
            status: "PENDING",
          });
        }

        // Case 2: Admin is the only owner
        else if (
          owner.type === "user" &&
          owner.name === "admin" &&
          owners.length === 1
        ) {
          results.push({
            assetName: asset.name,
            assetType: type,
            assetId: asset.id,
            currentOwnerName: owner.name,
            currentOwnerId: owner.id,
            currentOwnerType: "user",
            reason: "ADMIN_OWNER",
            reassignTo: {
              id: defaultTeam.id,
              name: defaultTeam.name,
              type: "team",
            },
            description: `Asset owned only by admin. Pre-delegating to ${defaultTeam.name}.`,
            comments: `Auto pre-delegated by PolicyGuard — admin-only ownership is a governance risk.`,
            status: "PENDING",
          });
        }

        // Case 3: Single individual user owns asset (no team)
        else if (
          owner.type === "user" &&
          owner.name !== "admin" &&
          owners.every((o: any) => o.type === "user")
        ) {
          results.push({
            assetName: asset.name,
            assetType: type,
            assetId: asset.id,
            currentOwnerName: owner.name,
            currentOwnerId: owner.id,
            currentOwnerType: "user",
            reason: "SINGLE_USER_OWNER",
            reassignTo: {
              id: defaultTeam.id,
              name: defaultTeam.name,
              type: "team",
            },
            description: `Asset owned by individual user only. Pre-delegating to ${defaultTeam.name}.`,
            comments: `Auto pre-delegated by PolicyGuard — team ownership recommended for governance.`,
            status: "PENDING",
          });
        }
      }
    }
  }

  return results;
}