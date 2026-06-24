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