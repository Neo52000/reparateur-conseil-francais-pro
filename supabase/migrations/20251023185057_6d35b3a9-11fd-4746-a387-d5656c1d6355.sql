-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies pour le bucket attachments
CREATE POLICY "Users can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments');

CREATE POLICY "Users can delete their own attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );