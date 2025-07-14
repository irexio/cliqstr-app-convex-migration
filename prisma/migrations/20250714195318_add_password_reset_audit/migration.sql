-- CreateTable
CREATE TABLE "ParentAuditLog" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedAlert" (
    "id" TEXT NOT NULL,
    "cliqId" TEXT NOT NULL,
    "triggeredById" TEXT NOT NULL,
    "reason" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetAudit" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "event" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RedAlert" ADD CONSTRAINT "RedAlert_cliqId_fkey" FOREIGN KEY ("cliqId") REFERENCES "Cliq"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedAlert" ADD CONSTRAINT "RedAlert_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
