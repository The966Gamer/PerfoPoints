
-- Create a table to track percentage meters for users
CREATE TABLE public.user_meters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  meter_type TEXT NOT NULL DEFAULT 'standard',
  current_percentage INTEGER NOT NULL DEFAULT 0 CHECK (current_percentage >= 0 AND current_percentage <= 100),
  target_percentage INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  prize_unlocked BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  CONSTRAINT unique_active_meter_per_user UNIQUE (user_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Create index for better performance
CREATE INDEX idx_user_meters_user_id_active ON public.user_meters(user_id, is_active);

-- Enable RLS
ALTER TABLE public.user_meters ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own meters
CREATE POLICY "Users can view their own meters"
  ON public.user_meters
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to manage all meters
CREATE POLICY "Admins can manage all meters"
  ON public.user_meters
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a table for meter history/logs
CREATE TABLE public.meter_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meter_id UUID NOT NULL REFERENCES public.user_meters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  old_percentage INTEGER NOT NULL,
  new_percentage INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  change_reason TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on meter history
ALTER TABLE public.meter_history ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own meter history
CREATE POLICY "Users can view their own meter history"
  ON public.meter_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to view all meter history
CREATE POLICY "Admins can view all meter history"
  ON public.meter_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update meter percentage with history tracking
CREATE OR REPLACE FUNCTION public.update_meter_percentage(
  p_user_id UUID,
  p_percentage_change INTEGER,
  p_reason TEXT DEFAULT NULL,
  p_changed_by UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meter_id UUID;
  v_old_percentage INTEGER;
  v_new_percentage INTEGER;
  v_meter_completed BOOLEAN := FALSE;
BEGIN
  -- Get the active meter for the user
  SELECT id, current_percentage
  INTO v_meter_id, v_old_percentage
  FROM public.user_meters
  WHERE user_id = p_user_id AND is_active = true
  LIMIT 1;
  
  -- If no active meter exists, return false
  IF v_meter_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new percentage (ensure it stays within 0-100)
  v_new_percentage := GREATEST(0, LEAST(100, v_old_percentage + p_percentage_change));
  
  -- Update the meter
  UPDATE public.user_meters
  SET 
    current_percentage = v_new_percentage,
    completed_at = CASE 
      WHEN v_new_percentage >= target_percentage AND completed_at IS NULL 
      THEN now() 
      ELSE completed_at 
    END,
    prize_unlocked = CASE 
      WHEN v_new_percentage >= target_percentage 
      THEN true 
      ELSE prize_unlocked 
    END
  WHERE id = v_meter_id;
  
  -- Log the change in history
  INSERT INTO public.meter_history (
    meter_id,
    user_id,
    old_percentage,
    new_percentage,
    change_amount,
    change_reason,
    changed_by
  ) VALUES (
    v_meter_id,
    p_user_id,
    v_old_percentage,
    v_new_percentage,
    p_percentage_change,
    p_reason,
    COALESCE(p_changed_by, auth.uid())
  );
  
  -- Check if meter was completed
  IF v_new_percentage >= 100 AND v_old_percentage < 100 THEN
    v_meter_completed := TRUE;
  END IF;
  
  RETURN v_meter_completed;
END;
$$;
