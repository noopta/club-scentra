-- AlterTable
ALTER TABLE "UserSettings"
  ADD COLUMN "privateProfile" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "allowFriendRequests" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "allowDirectMessages" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showLocationOnProfile" BOOLEAN NOT NULL DEFAULT true;
