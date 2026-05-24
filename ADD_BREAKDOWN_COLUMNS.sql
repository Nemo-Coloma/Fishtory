-- Migration: Add catch breakdown columns to reports table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS sold_kg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS processed_kg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS consumed_kg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS not_marketable_kg NUMERIC DEFAULT 0;
