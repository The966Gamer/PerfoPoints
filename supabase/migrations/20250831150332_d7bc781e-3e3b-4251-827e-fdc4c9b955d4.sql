
-- Add foreign key constraints to establish proper relationships

-- Add foreign key from point_requests to profiles
ALTER TABLE public.point_requests 
ADD CONSTRAINT point_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from point_requests to tasks
ALTER TABLE public.point_requests 
ADD CONSTRAINT point_requests_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Add foreign key from custom_requests to profiles
ALTER TABLE public.custom_requests 
ADD CONSTRAINT custom_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from user_meters to profiles
ALTER TABLE public.user_meters 
ADD CONSTRAINT user_meters_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from meter_history to user_meters
ALTER TABLE public.meter_history 
ADD CONSTRAINT meter_history_meter_id_fkey 
FOREIGN KEY (meter_id) REFERENCES public.user_meters(id) ON DELETE CASCADE;

-- Add foreign key from meter_history to profiles
ALTER TABLE public.meter_history 
ADD CONSTRAINT meter_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from points_history to profiles
ALTER TABLE public.points_history 
ADD CONSTRAINT points_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from points_history to tasks (optional since task_id can be null)
ALTER TABLE public.points_history 
ADD CONSTRAINT points_history_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;
