ALTER TABLE "user" ALTER COLUMN "email_verified" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "email_verified" SET DATA TYPE boolean USING (email_verified::int::boolean);
ALTER TABLE "user" ALTER COLUMN "email_verified" SET DEFAULT false;
