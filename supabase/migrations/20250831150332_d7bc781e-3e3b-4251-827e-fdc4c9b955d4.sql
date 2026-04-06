
-- Add foreign key constraints to establish proper relationships
-- Wrap each one so the migration can be re-run safely and can tolerate
-- optional tables that may not exist in every Perfo Points deployment.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'point_requests'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'point_requests_user_id_fkey'
  ) THEN
    ALTER TABLE public.point_requests
    ADD CONSTRAINT point_requests_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'point_requests'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'point_requests_task_id_fkey'
  ) THEN
    ALTER TABLE public.point_requests
    ADD CONSTRAINT point_requests_task_id_fkey
    FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'custom_requests'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'custom_requests_user_id_fkey'
  ) THEN
    ALTER TABLE public.custom_requests
    ADD CONSTRAINT custom_requests_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_meters'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_meters_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_meters
    ADD CONSTRAINT user_meters_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'meter_history'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meter_history_meter_id_fkey'
  ) THEN
    ALTER TABLE public.meter_history
    ADD CONSTRAINT meter_history_meter_id_fkey
    FOREIGN KEY (meter_id) REFERENCES public.user_meters(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'meter_history'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meter_history_user_id_fkey'
  ) THEN
    ALTER TABLE public.meter_history
    ADD CONSTRAINT meter_history_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'points_history'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'points_history_user_id_fkey'
  ) THEN
    ALTER TABLE public.points_history
    ADD CONSTRAINT points_history_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'points_history'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'points_history_task_id_fkey'
  ) THEN
    ALTER TABLE public.points_history
    ADD CONSTRAINT points_history_task_id_fkey
    FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;
  END IF;
END $$;
