-- Create user_google_tokens table for storing Google OAuth tokens
CREATE TABLE IF NOT EXISTS user_google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_google_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own tokens
CREATE POLICY "Users can access their own Google tokens"
  ON user_google_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own tokens
CREATE POLICY "Users can insert their own Google tokens"
  ON user_google_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own tokens
CREATE POLICY "Users can update their own Google tokens"
  ON user_google_tokens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own tokens
CREATE POLICY "Users can delete their own Google tokens"
  ON user_google_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_google_tokens_user_id ON user_google_tokens(user_id);
