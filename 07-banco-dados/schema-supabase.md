# 🗄️ Schema Supabase - MadBoat v3

## Visão Geral

O MadBoat v3 utiliza PostgreSQL através do Supabase como backend principal, implementando um schema robusco com Row Level Security (RLS), triggers automáticos e índices otimizados para performance. O design do banco suporta a jornada gamificada do usuário e integrações com Stripe.

## Estrutura do Banco de Dados

### 📊 Diagrama de Relacionamentos

```sql
-- Core Tables Structure
Users (Supabase Auth)
├── profiles (1:1)
├── stories (1:N)
├── timeline_events (1:N)
├── subscriptions (1:N)
└── payments (1:N)

Business Logic
├── personas (N:N with profiles)
├── business_types (Reference)
└── journey_steps (Reference)
```

## Tabelas Principais

### 👤 Profiles Table

```sql
-- User profiles extending Supabase Auth
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT NOT NULL,

  -- MadBoat specific fields
  onboarding_completed BOOLEAN DEFAULT FALSE,
  journey_progress INTEGER DEFAULT 0 CHECK (journey_progress >= 0 AND journey_progress <= 100),
  business_type_id UUID REFERENCES business_types(id),
  ai_skill TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,

  -- Constraints
  CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT profiles_full_name_length CHECK (char_length(full_name) >= 2)
);

-- Indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_business_type ON profiles(business_type_id);
CREATE INDEX idx_profiles_journey_progress ON profiles(journey_progress);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
```

### 📖 Stories Table

```sql
-- User stories for AI training and journey tracking
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Content
  title TEXT,
  content TEXT NOT NULL,
  skill TEXT NOT NULL,

  -- Analytics
  word_count INTEGER NOT NULL CHECK (word_count >= 0),
  reading_time INTEGER GENERATED ALWAYS AS (GREATEST(1, CEIL(word_count::DECIMAL / 250))) STORED,

  -- Journey context
  journey_step INTEGER DEFAULT 1,
  modal_type TEXT DEFAULT 'discovery',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,

  -- Constraints
  CONSTRAINT stories_content_length CHECK (char_length(content) >= 10),
  CONSTRAINT stories_skill_length CHECK (char_length(skill) >= 3),
  CONSTRAINT stories_word_count_consistency CHECK (word_count = array_length(string_to_array(trim(content), ' '), 1))
);

-- Indexes
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_journey_step ON stories(journey_step);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX idx_stories_word_count ON stories(word_count);
CREATE INDEX idx_stories_tags ON stories USING GIN(tags);
CREATE INDEX idx_stories_metadata ON stories USING GIN(metadata);

-- Full-text search
CREATE INDEX idx_stories_content_fts ON stories USING GIN(to_tsvector('portuguese', content));
CREATE INDEX idx_stories_skill_fts ON stories USING GIN(to_tsvector('portuguese', skill));

-- RLS Policies
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own stories"
  ON stories FOR ALL
  USING (auth.uid() = user_id);

-- Trigger for word count calculation
CREATE OR REPLACE FUNCTION calculate_word_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.word_count = array_length(
    string_to_array(trim(regexp_replace(NEW.content, '\s+', ' ', 'g')), ' '),
    1
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calculate_word_count
  BEFORE INSERT OR UPDATE ON stories
  FOR EACH ROW
  EXECUTE PROCEDURE calculate_word_count();

-- Trigger for updated_at
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
```

### 📅 Timeline Events Table

```sql
-- User journey and interaction tracking
CREATE TABLE timeline_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Event details
  event_type TEXT NOT NULL,
  event_category TEXT DEFAULT 'user_action',

  -- Context
  source_page TEXT,
  modal_type TEXT,
  card_number INTEGER,

  -- Data payload
  event_data JSONB DEFAULT '{}',

  -- Session context
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,

  -- Constraints
  CONSTRAINT timeline_events_event_type_check
    CHECK (event_type IN (
      'story_submitted', 'business_type_selected', 'card_unlocked',
      'modal_opened', 'modal_closed', 'page_viewed', 'journey_completed',
      'onboarding_step_completed', 'achievement_unlocked'
    )),

  CONSTRAINT timeline_events_category_check
    CHECK (event_category IN (
      'user_action', 'system_event', 'achievement', 'analytics', 'error'
    ))
);

-- Indexes
CREATE INDEX idx_timeline_events_user_id ON timeline_events(user_id);
CREATE INDEX idx_timeline_events_type ON timeline_events(event_type);
CREATE INDEX idx_timeline_events_category ON timeline_events(event_category);
CREATE INDEX idx_timeline_events_created_at ON timeline_events(created_at DESC);
CREATE INDEX idx_timeline_events_session_id ON timeline_events(session_id);
CREATE INDEX idx_timeline_events_data ON timeline_events USING GIN(event_data);

-- RLS Policies
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timeline events"
  ON timeline_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline events"
  ON timeline_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 🏢 Business Types Reference Table

```sql
-- Reference table for business type classifications
CREATE TABLE business_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Basic info
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,

  -- UI configuration
  icon TEXT DEFAULT 'Briefcase',
  gradient TEXT DEFAULT 'blue',
  color_psychology TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Status
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,

  -- Constraints
  CONSTRAINT business_types_category_check
    CHECK (category IN ('business_owner', 'personal_brand')),

  CONSTRAINT business_types_name_length
    CHECK (char_length(name) >= 3)
);

-- Initial data
INSERT INTO business_types (code, name, description, category, icon, gradient, color_psychology) VALUES
('entrepreneur-us', 'Empresário Brasileiro que mora nos EUA', 'Empresa estabelecida com operação internacional', 'business_owner', 'Building2', 'blue', 'trust, international reach'),
('entrepreneur-br', 'Empresário que mora no Brasil', 'Empresa nacional com visão de crescimento', 'business_owner', 'Briefcase', 'emerald', 'growth, national pride'),
('marketing-strategist', 'Estrategista de Marketing', 'Especialista em crescimento e posicionamento', 'personal_brand', 'Target', 'purple', 'strategy, creativity'),
('vibe-developer', 'Desenvolvedor VibeCoding', 'Criador de soluções tecnológicas vibrantes', 'personal_brand', 'Code', 'orange', 'innovation, energy'),
('traffic-manager', 'Gestor de tráfego', 'Especialista em acquisition e performance', 'personal_brand', 'Users', 'pink', 'engagement, performance');

-- Indexes
CREATE INDEX idx_business_types_category ON business_types(category);
CREATE INDEX idx_business_types_active ON business_types(active);
CREATE INDEX idx_business_types_sort_order ON business_types(sort_order);

-- RLS (Public read access)
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active business types"
  ON business_types FOR SELECT
  USING (active = TRUE);
```

## Integrações Stripe

### 💳 Subscriptions Table

```sql
-- Stripe subscription management
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Stripe identifiers
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,

  -- Subscription details
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Plan information
  plan_name TEXT NOT NULL,
  plan_description TEXT,

  -- Billing
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  interval_type TEXT NOT NULL,
  interval_count INTEGER DEFAULT 1,

  -- Features
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  canceled_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT subscriptions_status_check
    CHECK (status IN (
      'active', 'canceled', 'incomplete', 'incomplete_expired',
      'past_due', 'trialing', 'unpaid'
    )),

  CONSTRAINT subscriptions_currency_check
    CHECK (currency IN ('usd', 'brl', 'eur')),

  CONSTRAINT subscriptions_interval_check
    CHECK (interval_type IN ('day', 'week', 'month', 'year')),

  CONSTRAINT subscriptions_amount_positive
    CHECK (amount > 0)
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
```

### 💰 Payments Table

```sql
-- Payment history and transaction tracking
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Stripe identifiers
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_charge_id TEXT,

  -- Payment details
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,

  -- Payment method
  payment_method_type TEXT,
  last4 TEXT,
  brand TEXT,

  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',

  -- Failure information
  failure_code TEXT,
  failure_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,

  -- Constraints
  CONSTRAINT payments_status_check
    CHECK (status IN (
      'succeeded', 'pending', 'failed', 'canceled', 'refunded'
    )),

  CONSTRAINT payments_currency_check
    CHECK (currency IN ('usd', 'brl', 'eur')),

  CONSTRAINT payments_amount_positive
    CHECK (amount > 0)
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- RLS Policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
```

## Sistema de Personas

### 🎭 Personas Table

```sql
-- User persona system for role-based experience
CREATE TABLE personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,

  -- Behavior configuration
  default_preferences JSONB DEFAULT '{}',
  available_features JSONB DEFAULT '{}',
  ui_customizations JSONB DEFAULT '{}',

  -- AI behavior
  ai_prompt_adjustments JSONB DEFAULT '{}',
  recommended_workflows JSONB DEFAULT '{}',

  -- Status
  active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,

  -- Constraints
  CONSTRAINT personas_category_check
    CHECK (category IN ('developer', 'entrepreneur', 'creative', 'analyst', 'leader'))
);

-- Many-to-many relationship between users and personas
CREATE TABLE user_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE NOT NULL,

  -- Assignment details
  primary_persona BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,

  -- Custom preferences for this user-persona combination
  custom_preferences JSONB DEFAULT '{}',

  -- Ensure one primary persona per user
  UNIQUE(user_id, primary_persona) WHERE primary_persona = TRUE
);

-- Indexes
CREATE INDEX idx_user_personas_user_id ON user_personas(user_id);
CREATE INDEX idx_user_personas_persona_id ON user_personas(persona_id);
CREATE INDEX idx_user_personas_primary ON user_personas(primary_persona);

-- RLS Policies
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active personas"
  ON personas FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Users can manage own persona assignments"
  ON user_personas FOR ALL
  USING (auth.uid() = user_id);
```

## Funções e Triggers Avançados

### 📊 Analytics Functions

```sql
-- Function to get user journey progress
CREATE OR REPLACE FUNCTION get_user_journey_progress(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', user_uuid,
    'overall_progress', COALESCE(p.journey_progress, 0),
    'stories_count', (
      SELECT COUNT(*)
      FROM stories s
      WHERE s.user_id = user_uuid AND s.status = 'active'
    ),
    'total_words', (
      SELECT COALESCE(SUM(word_count), 0)
      FROM stories s
      WHERE s.user_id = user_uuid AND s.status = 'active'
    ),
    'business_type_selected', (
      p.business_type_id IS NOT NULL
    ),
    'onboarding_completed', p.onboarding_completed,
    'timeline_events_count', (
      SELECT COUNT(*)
      FROM timeline_events te
      WHERE te.user_id = user_uuid
    ),
    'last_activity', (
      SELECT MAX(created_at)
      FROM timeline_events te
      WHERE te.user_id = user_uuid
    )
  ) INTO result
  FROM profiles p
  WHERE p.id = user_uuid;

  RETURN COALESCE(result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track journey milestone
CREATE OR REPLACE FUNCTION track_journey_milestone(
  user_uuid UUID,
  milestone_type TEXT,
  milestone_data JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert timeline event
  INSERT INTO timeline_events (
    user_id,
    event_type,
    event_category,
    event_data
  ) VALUES (
    user_uuid,
    milestone_type,
    'achievement',
    milestone_data
  );

  -- Update user progress based on milestone
  UPDATE profiles
  SET
    journey_progress = CASE
      WHEN milestone_type = 'story_submitted' THEN GREATEST(journey_progress, 33)
      WHEN milestone_type = 'business_type_selected' THEN GREATEST(journey_progress, 66)
      WHEN milestone_type = 'journey_completed' THEN 100
      ELSE journey_progress
    END,
    updated_at = now()
  WHERE id = user_uuid;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 🔒 Security Functions

```sql
-- Function to check if user can access subscription features
CREATE OR REPLACE FUNCTION user_has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM subscriptions s
    WHERE s.user_id = user_uuid
      AND s.status = 'active'
      AND s.current_period_end > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security function for premium features
CREATE OR REPLACE FUNCTION user_can_access_premium()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_has_active_subscription(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Performance e Otimização

### 📈 Performance Monitoring

```sql
-- View for slow queries monitoring
CREATE VIEW slow_queries AS
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY mean_time DESC;

-- Indexes monitoring
CREATE VIEW unused_indexes AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexname::regclass)) AS size
FROM pg_stat_user_indexes
WHERE idx_tup_read = 0
  AND idx_tup_fetch = 0
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

### 🏃‍♂️ Query Optimization

```sql
-- Materialized view for user dashboard data
CREATE MATERIALIZED VIEW user_dashboard_stats AS
SELECT
  p.id as user_id,
  p.full_name,
  p.journey_progress,
  p.business_type_id,
  bt.name as business_type_name,
  COUNT(DISTINCT s.id) as stories_count,
  COALESCE(SUM(s.word_count), 0) as total_words,
  COUNT(DISTINCT te.id) as total_events,
  MAX(te.created_at) as last_activity
FROM profiles p
LEFT JOIN stories s ON s.user_id = p.id AND s.status = 'active'
LEFT JOIN timeline_events te ON te.user_id = p.id
LEFT JOIN business_types bt ON bt.id = p.business_type_id
GROUP BY p.id, p.full_name, p.journey_progress, p.business_type_id, bt.name;

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Scheduled refresh (via pg_cron extension if available)
-- SELECT cron.schedule('refresh-dashboard-stats', '*/15 * * * *', 'SELECT refresh_dashboard_stats();');
```

## Backup e Recovery

### 💾 Backup Strategy

```sql
-- Function to export user data (GDPR compliance)
CREATE OR REPLACE FUNCTION export_user_data(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  user_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', (
      SELECT row_to_json(p)
      FROM profiles p
      WHERE p.id = user_uuid
    ),
    'stories', (
      SELECT jsonb_agg(row_to_json(s))
      FROM stories s
      WHERE s.user_id = user_uuid
    ),
    'timeline_events', (
      SELECT jsonb_agg(row_to_json(te))
      FROM timeline_events te
      WHERE te.user_id = user_uuid
    ),
    'subscriptions', (
      SELECT jsonb_agg(row_to_json(sub))
      FROM subscriptions sub
      WHERE sub.user_id = user_uuid
    ),
    'exported_at', now()
  ) INTO user_data;

  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize user data
CREATE OR REPLACE FUNCTION anonymize_user_data(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update profiles with anonymized data
  UPDATE profiles
  SET
    full_name = 'Anonymized User',
    email = 'anonymized_' || user_uuid || '@example.com',
    avatar_url = NULL,
    metadata = '{}',
    updated_at = now()
  WHERE id = user_uuid;

  -- Anonymize story content but keep analytics
  UPDATE stories
  SET
    title = 'Anonymized Story',
    content = 'Content has been anonymized',
    skill = 'Anonymized Skill',
    metadata = '{}',
    updated_at = now()
  WHERE user_id = user_uuid;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

O schema do Supabase do MadBoat v3 é projetado para escalabilidade, performance e segurança, suportando tanto a experiência gamificada do usuário quanto as necessidades de negócio da plataforma.