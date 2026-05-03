-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add album_id to memories table
ALTER TABLE memories 
ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES albums(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- Create policies for albums
CREATE POLICY "Users can view their own albums" ON albums
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own albums" ON albums
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums" ON albums
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums" ON albums
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for albums updated_at
CREATE TRIGGER albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create index for album lookups
CREATE INDEX IF NOT EXISTS albums_user_id_idx ON albums(user_id);
CREATE INDEX IF NOT EXISTS memories_album_id_idx ON memories(album_id);