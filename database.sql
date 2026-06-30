-- 1. 创建用户角色枚举类型 (普通学生, 社团管理员, 校团委)
CREATE TYPE public.user_role AS ENUM ('student', 'club_leader', 'admin');

-- 2. 创建 profiles 表 (用户扩展表)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY, -- 关联 Supabase Auth
  student_id VARCHAR(20) UNIQUE,                                   -- 学号 (唯一)
  full_name VARCHAR(50) NOT NULL,                                  -- 姓名
  role public.user_role DEFAULT 'student'::public.user_role NOT NULL, -- 角色，默认普通学生
  avatar_url TEXT,                                                 -- 头像链接 (预留)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 开启行级安全策略 (Row Level Security, RLS) - Supabase 推荐的安全规范
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. 配置 RLS 策略
-- 允许所有已登录用户查看 profiles (用于展示社长信息、社员列表等)
CREATE POLICY "允许所有认证用户查看 profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ( true );

-- 允许用户更新自己的 profile 信息
CREATE POLICY "允许用户更新自己的 profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ( auth.uid() = id );

-- 5. 创建触发器函数：当用户注册 (auth.users 新增记录) 时，自动创建 profiles 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, student_id, role)
  VALUES (
    new.id,
    -- 从注册时传入的 user_metadata 中提取姓名、学号和角色
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'student_id',
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 绑定触发器到 auth.users 表
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. 创建业务枚举类型
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'club_status'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.club_status AS ENUM ('pending', 'active', 'cancelled');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'activity_status'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.activity_status AS ENUM ('recruiting', 'ongoing', 'finished', 'archived');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'application_status'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'application_target_type'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.application_target_type AS ENUM ('club', 'activity');
  END IF;
END
$$;

-- 8. 通用更新时间触发器函数
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 创建 clubs 表 (社团表)
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status public.club_status DEFAULT 'pending'::public.club_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有认证用户查看 clubs"
  ON public.clubs FOR SELECT
  TO authenticated
  USING ( true );

CREATE POLICY "允许管理员创建 clubs"
  ON public.clubs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "允许管理员更新 clubs"
  ON public.clubs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

DROP TRIGGER IF EXISTS set_clubs_updated_at ON public.clubs;
CREATE TRIGGER set_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_clubs_owner_id ON public.clubs(owner_id);
CREATE INDEX idx_clubs_status ON public.clubs(status);

-- 10. 创建 club_members 表 (社员表)
CREATE TABLE public.club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  position VARCHAR(50) DEFAULT 'member' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT uq_club_members_club_user UNIQUE (club_id, user_id)
);

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有认证用户查看 club_members"
  ON public.club_members FOR SELECT
  TO authenticated
  USING ( true );

CREATE POLICY "允许管理员和社团负责人管理 club_members"
  ON public.club_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'club_leader')
    )
  );

CREATE POLICY "允许管理员和社团负责人更新 club_members"
  ON public.club_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'club_leader')
    )
  );

CREATE POLICY "允许管理员和社团负责人删除 club_members"
  ON public.club_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'club_leader')
    )
  );

DROP TRIGGER IF EXISTS set_club_members_updated_at ON public.club_members;
CREATE TRIGGER set_club_members_updated_at
  BEFORE UPDATE ON public.club_members
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_club_members_club_id ON public.club_members(club_id);
CREATE INDEX idx_club_members_user_id ON public.club_members(user_id);

-- 11. 创建 activities 表 (活动表)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  content TEXT NOT NULL,
  location VARCHAR(120),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
  status public.activity_status DEFAULT 'recruiting'::public.activity_status NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT chk_activities_time_range CHECK (end_time IS NULL OR start_time IS NULL OR end_time >= start_time)
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有认证用户查看 activities"
  ON public.activities FOR SELECT
  TO authenticated
  USING ( true );

CREATE POLICY "允许管理员和社团负责人创建 activities"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'club_leader')
    )
  );

CREATE POLICY "允许管理员和社团负责人更新 activities"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'club_leader')
    )
  );

CREATE POLICY "允许管理员和社团负责人删除 activities"
  ON public.activities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'club_leader')
    )
  );

DROP TRIGGER IF EXISTS set_activities_updated_at ON public.activities;
CREATE TRIGGER set_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_activities_club_id ON public.activities(club_id);
CREATE INDEX idx_activities_status ON public.activities(status);
CREATE INDEX idx_activities_created_by ON public.activities(created_by);

-- 12. 创建 applications 表 (报名/申请表)
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type public.application_target_type NOT NULL,
  target_id UUID NOT NULL,
  status public.application_status DEFAULT 'pending'::public.application_status NOT NULL,
  reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT uq_applications_target UNIQUE (applicant_id, target_type, target_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许申请人查看自己的 applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    applicant_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'club_leader')
    )
  );

CREATE POLICY "允许申请人创建自己的 applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "允许管理员和社团负责人更新 applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'club_leader')
    )
  );

CREATE POLICY "允许申请人撤回或管理员删除 applications"
  ON public.applications FOR DELETE
  TO authenticated
  USING (
    applicant_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'club_leader')
    )
  );

DROP TRIGGER IF EXISTS set_applications_updated_at ON public.applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX idx_applications_target ON public.applications(target_type, target_id);
CREATE INDEX idx_applications_status ON public.applications(status);
