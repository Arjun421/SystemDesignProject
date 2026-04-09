-- CreateEnum
CREATE TYPE "LearningDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "UserLearningPathStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- AlterTable
ALTER TABLE "resources"
ADD COLUMN "category" TEXT,
ADD COLUMN "tags" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "course_module_progress" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "module_index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "course_module_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_paths" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "difficulty" "LearningDifficulty" NOT NULL,
    "estimated_hours" INTEGER NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_path_items" (
    "id" TEXT NOT NULL,
    "learning_path_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "learning_path_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_learning_paths" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "learning_path_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "status" "UserLearningPathStatus" NOT NULL DEFAULT 'ACTIVE',
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "completed_item_ids" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "user_learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resources_type_created_at_idx" ON "resources"("type", "created_at");

-- CreateIndex
CREATE INDEX "resources_category_idx" ON "resources"("category");

-- CreateIndex
CREATE INDEX "resources_title_idx" ON "resources"("title");

-- CreateIndex
CREATE INDEX "borrow_records_user_id_status_idx" ON "borrow_records"("user_id", "status");

-- CreateIndex
CREATE INDEX "borrow_records_due_date_status_idx" ON "borrow_records"("due_date", "status");

-- CreateIndex
CREATE INDEX "borrow_records_book_id_status_idx" ON "borrow_records"("book_id", "status");

-- CreateIndex
CREATE INDEX "enrollments_user_id_status_idx" ON "enrollments"("user_id", "status");

-- CreateIndex
CREATE INDEX "enrollments_course_id_status_idx" ON "enrollments"("course_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "course_module_progress_enrollment_id_module_id_key" ON "course_module_progress"("enrollment_id", "module_id");

-- CreateIndex
CREATE INDEX "course_module_progress_enrollment_id_module_index_idx" ON "course_module_progress"("enrollment_id", "module_index");

-- CreateIndex
CREATE UNIQUE INDEX "learning_paths_slug_key" ON "learning_paths"("slug");

-- CreateIndex
CREATE INDEX "learning_paths_difficulty_created_at_idx" ON "learning_paths"("difficulty", "created_at");

-- CreateIndex
CREATE INDEX "learning_paths_is_premium_created_at_idx" ON "learning_paths"("is_premium", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "learning_path_items_learning_path_id_position_key" ON "learning_path_items"("learning_path_id", "position");

-- CreateIndex
CREATE INDEX "learning_path_items_learning_path_id_idx" ON "learning_path_items"("learning_path_id");

-- CreateIndex
CREATE INDEX "learning_path_items_resource_id_idx" ON "learning_path_items"("resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_learning_paths_user_id_learning_path_id_key" ON "user_learning_paths"("user_id", "learning_path_id");

-- CreateIndex
CREATE INDEX "user_learning_paths_user_id_status_idx" ON "user_learning_paths"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_learning_paths_learning_path_id_status_idx" ON "user_learning_paths"("learning_path_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "borrow_records_user_book_active_unique"
ON "borrow_records"("user_id", "book_id")
WHERE "status" IN ('ACTIVE', 'OVERDUE');

-- AddForeignKey
ALTER TABLE "course_module_progress"
ADD CONSTRAINT "course_module_progress_enrollment_id_fkey"
FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_items"
ADD CONSTRAINT "learning_path_items_learning_path_id_fkey"
FOREIGN KEY ("learning_path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_items"
ADD CONSTRAINT "learning_path_items_resource_id_fkey"
FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_learning_paths"
ADD CONSTRAINT "user_learning_paths_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_learning_paths"
ADD CONSTRAINT "user_learning_paths_learning_path_id_fkey"
FOREIGN KEY ("learning_path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
