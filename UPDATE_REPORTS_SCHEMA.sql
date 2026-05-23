-- Migration: Add catch_status to reports table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS catch_status text;

-- If you are also getting errors for species_id, processing_method_id, and location_id
-- (since your schema shows species, processing_method, and location as text),
-- you should add those columns as well to match your CatchReportForm payload:

ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS species_id text,
ADD COLUMN IF NOT EXISTS processing_method_id text,
ADD COLUMN IF NOT EXISTS location_id text;
