-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "businessImpact" TEXT,
    "legalImpact" TEXT,
    "estimatedTime" INTEGER,
    "confidenceScore" INTEGER NOT NULL,
    "context" JSONB,
    "workflowId" TEXT,
    "dismissedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendation_actions" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_recommendation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "ai_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workflow_executions" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentStep" INTEGER,
    "progress" INTEGER,
    "results" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ai_workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_daily_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "greeting" TEXT,
    "workload" JSONB,
    "priorities" JSONB,
    "suggestedOrder" JSONB,
    "estimatedCompletion" INTEGER,
    "remainingFreeTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_daily_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_daily_plans_userId_date_key" ON "ai_daily_plans"("userId", "date");

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation_actions" ADD CONSTRAINT "ai_recommendation_actions_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "ai_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workflow_executions" ADD CONSTRAINT "ai_workflow_executions_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
