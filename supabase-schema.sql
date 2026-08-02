-- ============================================
-- PRANA - Schema completo
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Profiles (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'alumno' CHECK (role IN ('alumno', 'profesor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: crear profile automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  specialty TEXT,
  discipline TEXT DEFAULT 'Yoga',
  location TEXT,
  bio TEXT,
  price TEXT DEFAULT '$8.000/clase',
  available_days TEXT[] DEFAULT '{}',
  email TEXT,
  phone TEXT,
  images TEXT[] DEFAULT '{}',
  rating DECIMAL(3,1) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  plan TEXT DEFAULT 'ninguno' CHECK (plan IN ('ninguno', 'inicial', 'destacado', 'institucional')),
  plan_active BOOLEAN DEFAULT FALSE,
  plan_expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'activo' CHECK (status IN ('pendiente', 'activo', 'inactivo')),
  impressions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (tienda)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'general',
  stock INT DEFAULT 999,
  active BOOLEAN DEFAULT TRUE,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  teacher_name TEXT,
  date DATE,
  time TEXT,
  price DECIMAL(12,2),
  status TEXT DEFAULT 'confirmada',
  payment_status TEXT DEFAULT 'pendiente',
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  student_name TEXT,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, teacher_id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  type TEXT CHECK (type IN ('booking', 'subscription', 'product')),
  amount DECIMAL(12,2),
  description TEXT,
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, teacher_id)
);

-- Admin config (precios y configuración editable)
CREATE TABLE IF NOT EXISTS admin_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuración por defecto
INSERT INTO admin_config (key, value, label) VALUES
  ('plan_inicial_price', '6000', 'Precio Plan Inicial (ARS/mes)'),
  ('plan_destacado_price', '12000', 'Precio Plan Destacado Pro (ARS/mes)'),
  ('plan_institucional_price', '24000', 'Precio Plan Institucional (ARS/mes)'),
  ('site_name', 'Prana', 'Nombre del sitio'),
  ('commission_pct', '10', 'Comisión por reserva (%)')
ON CONFLICT (key) DO NOTHING;

-- Productos por defecto (tienda)
INSERT INTO products (name, description, price, category, features) VALUES
  ('Mat Eco Rubber Align 5mm', 'Mat profesional con guías de alineación y máximo agarre', 42000, 'mats', ARRAY['Caucho natural ecológico', 'Guías de alineación impresas', 'Espesor 5mm', 'Antideslizante superior']),
  ('Mat Extra Grip Reformer 15mm', 'Mat ultra grueso para Reformer con agarre extremo', 48500, 'mats', ARRAY['Grosor extra 15mm', 'Grip de doble capa', 'Resistente al sudor']),
  ('Anillo Magic Circle Flex', 'Aro de Pilates flexible con agarraderas acolchadas', 18500, 'accesorios', ARRAY['Acero flexible recubierto', 'Agarraderas ergonómicas', 'Resistencia media-alta']),
  ('Bloques de Corcho (Par)', 'Bloques ecológicos de corcho natural para yoga', 14200, 'accesorios', ARRAY['Corcho natural 100%', 'Alta densidad', 'Antideslizante']),
  ('Medias Antideslizantes', 'Medias grip para Pilates y yoga con suela antideslizante', 6500, 'ropa', ARRAY['Puntos de grip en suela', 'Algodón + elastano', 'Talle único']),
  ('Cinta Strap 2.5m', 'Cinta de yoga para estiramiento y posturas avanzadas', 8900, 'accesorios', ARRAY['Algodón resistente', 'Hebilla ajustable', '2.5 metros']),
  ('Kit Bandas Elásticas x3', 'Set de 3 bandas con diferentes niveles de resistencia', 12500, 'accesorios', ARRAY['3 niveles: suave, medio, fuerte', 'Látex natural', 'Bolsa incluida']),
  ('Spray Orgánico Limpia Mat', 'Limpiador natural para mats con aceites esenciales', 9800, 'limpieza', ARRAY['Ingredientes orgánicos', 'Aroma lavanda', '250ml']),
  ('Calza Seamless High-Waist', 'Calza sin costuras de cintura alta para máxima comodidad', 28000, 'ropa', ARRAY['Sin costuras', 'Tiro alto', 'Tejido compresivo', 'Secado rápido'])
ON CONFLICT DO NOTHING;

-- Profesores de muestra
INSERT INTO teachers (name, specialty, discipline, location, bio, price, available_days, email, phone, images, rating, review_count, plan, plan_active, status) VALUES
  ('Lena Rostova', 'Vinyasa Flow', 'Yoga', 'San Telmo', 'Me enfoco en la conexión entre la respiración y el movimiento. 500-RYT.', '$8.000/clase', ARRAY['Lun','Mié','Vie'], 'lena@prana.com.ar', '5491133445566', ARRAY['https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600'], 4.9, 124, 'destacado', TRUE, 'activo'),
  ('Marcus Chen', 'Ashtanga y Meditación', 'Yoga', 'Palermo', 'Basado en los métodos tradicionales de Ashtanga con un enfoque moderno y consciente.', '$7.500/clase', ARRAY['Mar','Jue','Sáb'], 'marcus@prana.com.ar', '5491122334455', ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600'], 4.8, 89, 'inicial', TRUE, 'activo'),
  ('Sofia Ali', 'Yin / Restaurativo', 'Yoga', 'Belgrano', 'Técnicas de estiramiento profundo y relajación para una recuperación total.', '$9.000/clase', ARRAY['Lun','Mar','Jue'], 'sofia@prana.com.ar', '5491155667788', ARRAY['https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600'], 5.0, 210, 'destacado', TRUE, 'activo'),
  ('Clara Mendonça', 'Pilates Reformer & Postural', 'Pilates', 'Recoleta', 'Instructora certificada internacionalmente en Pilates Reformer, cadillac y rehabilitación postural.', '$9.500/clase', ARRAY['Lun','Mié','Vie','Sáb'], 'clara@prana.com.ar', '5491144556677', ARRAY['https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=600'], 4.9, 98, 'institucional', TRUE, 'activo'),
  ('Valentina Rossi', 'Pilates Mat & Barre', 'Pilates', 'Palermo', 'Clases dinámicas de Pilates Mat con accesorios combinados con técnica Barre.', '$8.500/clase', ARRAY['Mar','Jue','Vie'], 'valentina@prana.com.ar', '5491188990011', ARRAY['https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600'], 4.8, 74, 'inicial', TRUE, 'activo'),
  ('Esteban Quiroga', 'Vinyasa & Pilates Reformer', 'Yoga & Pilates', 'Belgrano', 'Enfoque holístico combinando la fluidez del Vinyasa Yoga con la estabilidad del Pilates.', '$10.000/clase', ARRAY['Lun','Mié','Sáb'], 'esteban@prana.com.ar', '5491177665544', ARRAY['https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600'], 5.0, 142, 'destacado', TRUE, 'activo')
ON CONFLICT DO NOTHING;

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Policies: lectura pública para teachers y products
CREATE POLICY "Teachers públicos" ON teachers FOR SELECT USING (status = 'activo');
CREATE POLICY "Products públicos" ON products FOR SELECT USING (active = TRUE);
CREATE POLICY "Reviews públicas" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Config pública" ON admin_config FOR SELECT USING (TRUE);

-- Policies: usuarios autenticados
CREATE POLICY "Perfil propio" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Mis bookings" ON bookings FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Mis favoritos" ON favorites FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Mis reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = student_id);
