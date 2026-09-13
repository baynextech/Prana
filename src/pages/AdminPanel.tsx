import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, DollarSign, TrendingUp, Package, Settings,
  ChevronRight, Edit2, Trash2, Plus, Save, X, Check, Calendar,
  Star, LayoutDashboard, ArrowUpRight, Eye, EyeOff, RefreshCw
} from "lucide-react";

// ─── API helper ─────────────────────────────────────────────────────────────
const API = (token: string) => ({
  get: (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  post: (url: string, body: any) => fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
  put: (url: string, body: any) => fetch(url, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
  del: (url: string) => fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
});

type Tab = "dashboard" | "teachers" | "products" | "users" | "bookings" | "reviews" | "transactions" | "config";

// ─── Estilos base ────────────────────────────────────────────────────────────
const btn = {
  primary: "inline-flex items-center gap-2 bg-[#8CAE99] hover:bg-[#7a9d88] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm",
  secondary: "inline-flex items-center gap-2 bg-white border border-[#E5E5E5] hover:border-[#8CAE99] text-[#2C2C2C] px-5 py-2.5 rounded-full text-sm font-medium transition-colors",
  danger: "inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
  ghost: "inline-flex items-center gap-1.5 text-[#8CAE99] hover:text-[#7a9d88] text-sm font-medium transition-colors",
  icon: "p-2 rounded-full hover:bg-[#8CAE99]/10 text-[#5D5D5D] hover:text-[#8CAE99] transition-colors",
};

const card = "bg-white border border-[#E5E5E5] rounded-2xl";
const input = "w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#8CAE99] focus:ring-1 focus:ring-[#8CAE99]/30 bg-white placeholder:text-[#5D5D5D]/50";
const badge = {
  green: "px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8CAE99]/15 text-[#5a7d68]",
  gray: "px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E5E5E5] text-[#5D5D5D]",
  red: "px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700",
  blue: "px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700",
  purple: "px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700",
  yellow: "px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700",
};

// ─── Componente principal ─────────────────────────────────────────────────────
export function AdminPanel() {
  const { isAdmin, token, profile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [dashboard, setDashboard] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [config, setConfig] = useState<any[]>([]);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState(false);
  const [newTeacher, setNewTeacher] = useState(false);
  const [loaded, setLoaded] = useState<Set<Tab>>(new Set());

  useEffect(() => {
    if (!isAdmin) { navigate("/perfil"); return; }
    loadTab("dashboard");
  }, [isAdmin]);

  useEffect(() => { if (!loaded.has(tab)) loadTab(tab); }, [tab]);

  const api = API(token!);

  const loadTab = async (t: Tab) => {
    setLoaded(s => new Set(s).add(t));
    if (t === "dashboard") setDashboard(await api.get("/api/admin/dashboard"));
    if (t === "teachers") setTeachers(await api.get("/api/admin/teachers"));
    if (t === "products") setProducts(await api.get("/api/admin/products"));
    if (t === "users") setUsers(await api.get("/api/admin/users"));
    if (t === "bookings") setBookings(await api.get("/api/admin/bookings"));
    if (t === "reviews") setReviews(await api.get("/api/admin/reviews"));
    if (t === "transactions") setTransactions(await api.get("/api/admin/transactions"));
    if (t === "config") {
      const data = await api.get("/api/admin/config");
      setConfig(data);
      setConfigValues(Object.fromEntries(data.map((c: any) => [c.key, c.value])));
    }
  };

  const reload = (t: Tab) => { setLoaded(s => { const n = new Set(s); n.delete(t); return n; }); loadTab(t); };

  // ── Handlers ──
  const saveConfig = async (key: string) => {
    await api.put("/api/admin/config", { key, value: configValues[key] });
    setConfig(c => c.map(item => item.key === key ? { ...item, value: configValues[key] } : item));
    setEditingConfig(null);
  };

  const toggleTeacherStatus = async (id: string, status: string) => {
    const newStatus = status === "activo" ? "inactivo" : "activo";
    await api.put(`/api/admin/teachers/${id}`, { status: newStatus });
    setTeachers(ts => ts.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTeacher = async (id: string) => {
    if (!confirm("¿Eliminar este profesor? Esta acción es irreversible.")) return;
    await api.del(`/api/admin/teachers/${id}`);
    setTeachers(ts => ts.filter(t => t.id !== id));
  };

  const saveTeacher = async (teacher: any) => {
    if (teacher.id) {
      const updated = await api.put(`/api/admin/teachers/${teacher.id}`, teacher);
      setTeachers(ts => ts.map(t => t.id === teacher.id ? updated : t));
    } else {
      const created = await api.post("/api/admin/teachers", teacher);
      setTeachers(ts => [created, ...ts]);
    }
    setEditingTeacher(null);
    setNewTeacher(false);
  };

  const saveProduct = async (product: any) => {
    if (product.id) {
      const updated = await api.put(`/api/admin/products/${product.id}`, product);
      setProducts(ps => ps.map(p => p.id === product.id ? updated : p));
    } else {
      const created = await api.post("/api/admin/products", product);
      setProducts(ps => [...ps, created]);
    }
    setEditingProduct(null);
    setNewProduct(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Desactivar este producto?")) return;
    await api.del(`/api/admin/products/${id}`);
    setProducts(ps => ps.map(p => p.id === id ? { ...p, active: false } : p));
  };

  const changeUserRole = async (id: string, role: string) => {
    await api.put(`/api/admin/users/${id}/role`, { role });
    setUsers(us => us.map(u => u.id === id ? { ...u, role } : u));
  };

  const updateBookingStatus = async (id: string, status: string) => {
    await api.put(`/api/admin/bookings/${id}`, { status });
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b));
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("¿Eliminar esta reserva?")) return;
    await api.del(`/api/admin/bookings/${id}`);
    setBookings(bs => bs.filter(b => b.id !== id));
  };

  const deleteReview = async (id: string) => {
    if (!confirm("¿Eliminar esta reseña?")) return;
    await api.del(`/api/admin/reviews/${id}`);
    setReviews(rs => rs.filter(r => r.id !== id));
  };

  if (!isAdmin) return null;

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "teachers", label: "Profesores", icon: BookOpen, count: teachers.length || undefined },
    { id: "products", label: "Productos", icon: Package, count: products.length || undefined },
    { id: "users", label: "Usuarios", icon: Users, count: users.length || undefined },
    { id: "bookings", label: "Reservas", icon: Calendar, count: bookings.length || undefined },
    { id: "reviews", label: "Reseñas", icon: Star, count: reviews.length || undefined },
    { id: "transactions", label: "Transacciones", icon: DollarSign },
    { id: "config", label: "Configuración", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] px-6 py-4 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8CAE99]/20 flex items-center justify-center">
              <span className="text-[#8CAE99] text-sm font-bold">P</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#2C2C2C]">Panel de Administración</h1>
              <p className="text-xs text-[#5D5D5D]">Hola, {profile?.name || "Admin"}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-[#5D5D5D] hover:text-[#8CAE99] transition-colors font-medium"
          >
            Ver sitio <ArrowUpRight size={14} />
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0">
          <nav className={`${card} overflow-hidden sticky top-24`}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-[#8CAE99]/10 text-[#8CAE99] border-l-[3px] border-[#8CAE99]"
                    : "text-[#5D5D5D] hover:bg-[#FDFBF7] border-l-[3px] border-transparent"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <t.icon size={16} />
                  {t.label}
                </span>
                {t.count != null && (
                  <span className="text-[10px] bg-[#E5E5E5] text-[#5D5D5D] rounded-full px-1.5 py-0.5 font-semibold">{t.count}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && dashboard && (
            <div className="space-y-6">
              <SectionHeader title="Dashboard" subtitle="Resumen general de la plataforma" onRefresh={() => reload("dashboard")} />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Usuarios", value: dashboard.totalUsers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Profesores activos", value: dashboard.totalTeachers ?? 0, icon: BookOpen, color: "text-[#8CAE99]", bg: "bg-[#8CAE99]/10" },
                  { label: "Reservas", value: dashboard.totalBookings ?? 0, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Revenue total", value: `$${(dashboard.revenue ?? 0).toLocaleString("es-AR")}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
                ].map(stat => (
                  <div key={stat.label} className={`${card} p-5`}>
                    <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon size={18} className={stat.color} />
                    </div>
                    <p className="text-[10px] text-[#5D5D5D] uppercase tracking-widest font-medium mb-1">{stat.label}</p>
                    <p className="text-2xl font-light text-[#2C2C2C]">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className={`${card} p-5`}>
                  <h3 className="font-medium text-[#2C2C2C] mb-4 text-sm">Revenue por tipo</h3>
                  {[
                    { label: "Membresías", value: dashboard.revenueByType?.subscriptions ?? 0, color: "bg-purple-400" },
                    { label: "Reservas", value: dashboard.revenueByType?.bookings ?? 0, color: "bg-blue-400" },
                    { label: "Tienda", value: dashboard.revenueByType?.products ?? 0, color: "bg-[#8CAE99]" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-[#E5E5E5] last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-sm text-[#5D5D5D]">{item.label}</span>
                      </div>
                      <span className="font-medium text-[#2C2C2C] text-sm">${item.value.toLocaleString("es-AR")}</span>
                    </div>
                  ))}
                </div>
                <div className={`${card} p-5`}>
                  <h3 className="font-medium text-[#2C2C2C] mb-4 text-sm">Últimos usuarios</h3>
                  {(dashboard.recentUsers ?? []).map((u: any) => (
                    <div key={u.email} className="flex items-center justify-between py-2.5 border-b border-[#E5E5E5] last:border-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#8CAE99]/20 flex items-center justify-center text-xs font-medium text-[#8CAE99]">
                          {(u.name || u.email)?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2C2C2C] leading-tight">{u.name || "—"}</p>
                          <p className="text-xs text-[#5D5D5D]">{u.email}</p>
                        </div>
                      </div>
                      <span className={u.role === "admin" ? badge.red : u.role === "profesor" ? badge.blue : badge.gray}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PROFESORES ── */}
          {tab === "teachers" && (
            <div className="space-y-4">
              <SectionHeader
                title="Profesores"
                subtitle={`${teachers.length} registrados en la plataforma`}
                onRefresh={() => reload("teachers")}
                action={
                  <button
                    onClick={() => { setNewTeacher(true); setEditingTeacher({ name: "", email: "", discipline: "", location: "", bio: "", price: "", plan: "ninguno", status: "activo", specialty: "", available_days: "", phone: "" }); }}
                    className={btn.primary}
                  >
                    <Plus size={15} /> Nuevo profesor
                  </button>
                }
              />

              {(editingTeacher || newTeacher) && (
                <TeacherForm
                  teacher={editingTeacher}
                  onSave={saveTeacher}
                  onCancel={() => { setEditingTeacher(null); setNewTeacher(false); }}
                />
              )}

              <div className={`${card} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E5E5]">
                        {["Profesor", "Disciplina", "Zona", "Plan", "Estado", "Acciones"].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#5D5D5D] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.length === 0 && (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-[#5D5D5D] text-sm">Sin profesores registrados</td></tr>
                      )}
                      {teachers.map(t => (
                        <tr key={t.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#FDFBF7] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              {t.photo_url
                                ? <img src={t.photo_url} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                                : <div className="w-8 h-8 rounded-full bg-[#8CAE99]/20 flex items-center justify-center text-xs font-medium text-[#8CAE99]">{t.name?.[0]}</div>
                              }
                              <div>
                                <p className="font-medium text-[#2C2C2C]">{t.name}</p>
                                <p className="text-xs text-[#5D5D5D]">{t.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#5D5D5D]">{t.discipline || "—"}</td>
                          <td className="px-5 py-4 text-[#5D5D5D]">{t.location || "—"}</td>
                          <td className="px-5 py-4">
                            <span className={t.plan_active ? badge.green : badge.gray}>{t.plan || "ninguno"}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={t.status === "activo" ? badge.green : badge.red}>{t.status}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingTeacher(t)} className={btn.icon} title="Editar">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => toggleTeacherStatus(t.id, t.status)} className={btn.icon} title={t.status === "activo" ? "Desactivar" : "Activar"}>
                                {t.status === "activo" ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button onClick={() => deleteTeacher(t.id)} className="p-2 rounded-full hover:bg-red-50 text-[#5D5D5D] hover:text-red-500 transition-colors" title="Eliminar">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTOS ── */}
          {tab === "products" && (
            <div className="space-y-4">
              <SectionHeader
                title="Productos"
                subtitle={`${products.length} productos en la tienda`}
                onRefresh={() => reload("products")}
                action={
                  <button
                    onClick={() => { setNewProduct(true); setEditingProduct({ name: "", description: "", price: "", category: "accesorios", stock: 999, active: true, images: [], features: [] }); }}
                    className={btn.primary}
                  >
                    <Plus size={15} /> Nuevo producto
                  </button>
                }
              />

              {(editingProduct || newProduct) && (
                <ProductForm product={editingProduct} onSave={saveProduct} onCancel={() => { setEditingProduct(null); setNewProduct(false); }} />
              )}

              <div className={`${card} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E5E5]">
                        {["Producto", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#5D5D5D] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 && (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-[#5D5D5D] text-sm">Sin productos registrados</td></tr>
                      )}
                      {products.map(p => (
                        <tr key={p.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#FDFBF7] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-[#E5E5E5]" />
                                : <div className="w-9 h-9 rounded-xl bg-[#E5E5E5] flex items-center justify-center"><Package size={14} className="text-[#5D5D5D]" /></div>
                              }
                              <div>
                                <p className="font-medium text-[#2C2C2C]">{p.name}</p>
                                <p className="text-xs text-[#5D5D5D] max-w-[180px] truncate">{p.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#5D5D5D] capitalize">{p.category}</td>
                          <td className="px-5 py-4 font-medium text-[#2C2C2C]">${Number(p.price).toLocaleString("es-AR")}</td>
                          <td className="px-5 py-4 text-[#5D5D5D]">{p.stock}</td>
                          <td className="px-5 py-4">
                            <span className={p.active ? badge.green : badge.red}>{p.active ? "Activo" : "Inactivo"}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingProduct(p)} className={btn.icon} title="Editar"><Edit2 size={14} /></button>
                              <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-full hover:bg-red-50 text-[#5D5D5D] hover:text-red-500 transition-colors" title="Desactivar"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── USUARIOS ── */}
          {tab === "users" && (
            <div className="space-y-4">
              <SectionHeader title="Usuarios" subtitle={`${users.length} usuarios registrados`} onRefresh={() => reload("users")} />
              <div className={`${card} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E5E5]">
                        {["Usuario", "Email", "Rol actual", "Registrado", "Cambiar rol"].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#5D5D5D] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && (
                        <tr><td colSpan={5} className="px-5 py-10 text-center text-[#5D5D5D] text-sm">Sin usuarios registrados</td></tr>
                      )}
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#FDFBF7] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#8CAE99]/20 flex items-center justify-center text-xs font-medium text-[#8CAE99]">
                                {(u.name || u.email)?.[0]?.toUpperCase()}
                              </div>
                              <span className="font-medium text-[#2C2C2C]">{u.name || "Sin nombre"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#5D5D5D]">{u.email}</td>
                          <td className="px-5 py-4">
                            <span className={u.role === "admin" ? badge.red : u.role === "profesor" ? badge.blue : badge.gray}>{u.role}</span>
                          </td>
                          <td className="px-5 py-4 text-[#5D5D5D] text-xs">{new Date(u.created_at).toLocaleDateString("es-AR")}</td>
                          <td className="px-5 py-4">
                            <select
                              value={u.role}
                              onChange={e => changeUserRole(u.id, e.target.value)}
                              className="text-xs border border-[#E5E5E5] rounded-full px-3 py-1.5 text-[#2C2C2C] focus:outline-none focus:border-[#8CAE99] bg-white cursor-pointer"
                            >
                              <option value="alumno">Alumno</option>
                              <option value="profesor">Profesor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── RESERVAS ── */}
          {tab === "bookings" && (
            <div className="space-y-4">
              <SectionHeader title="Reservas" subtitle={`${bookings.length} reservas en el sistema`} onRefresh={() => reload("bookings")} />
              <div className={`${card} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E5E5]">
                        {["Alumno", "Profesor", "Fecha", "Precio", "Estado", "Acciones"].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#5D5D5D] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 && (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-[#5D5D5D] text-sm">Sin reservas aún</td></tr>
                      )}
                      {bookings.map(b => (
                        <tr key={b.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#FDFBF7] transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-medium text-[#2C2C2C]">{b.profiles?.name || "—"}</p>
                            <p className="text-xs text-[#5D5D5D]">{b.profiles?.email}</p>
                          </td>
                          <td className="px-5 py-4 text-[#5D5D5D]">{b.teachers?.name || "—"}</td>
                          <td className="px-5 py-4 text-xs text-[#5D5D5D]">{b.booking_date ? new Date(b.booking_date).toLocaleDateString("es-AR") : new Date(b.created_at).toLocaleDateString("es-AR")}</td>
                          <td className="px-5 py-4 font-medium text-[#2C2C2C]">{b.price ? `$${Number(b.price).toLocaleString("es-AR")}` : "—"}</td>
                          <td className="px-5 py-4">
                            <select
                              value={b.status || "pendiente"}
                              onChange={e => updateBookingStatus(b.id, e.target.value)}
                              className="text-xs border border-[#E5E5E5] rounded-full px-3 py-1.5 text-[#2C2C2C] focus:outline-none focus:border-[#8CAE99] bg-white cursor-pointer"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="confirmada">Confirmada</option>
                              <option value="cancelada">Cancelada</option>
                              <option value="completada">Completada</option>
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <button onClick={() => deleteBooking(b.id)} className="p-2 rounded-full hover:bg-red-50 text-[#5D5D5D] hover:text-red-500 transition-colors" title="Eliminar">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── RESEÑAS ── */}
          {tab === "reviews" && (
            <div className="space-y-4">
              <SectionHeader title="Reseñas" subtitle={`${reviews.length} reseñas publicadas`} onRefresh={() => reload("reviews")} />
              <div className="grid gap-3">
                {reviews.length === 0 && (
                  <div className={`${card} p-10 text-center text-[#5D5D5D] text-sm`}>Sin reseñas publicadas</div>
                )}
                {reviews.map(r => (
                  <div key={r.id} className={`${card} p-5 flex items-start justify-between gap-4`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#8CAE99]/20 flex items-center justify-center text-xs font-medium text-[#8CAE99]">
                          {(r.profiles?.name || r.user_name || "?")?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2C2C2C]">{r.profiles?.name || r.user_name || "Anónimo"}</p>
                          <p className="text-xs text-[#5D5D5D]">sobre <span className="text-[#8CAE99] font-medium">{r.teachers?.name || r.teacher_name || "—"}</span></p>
                        </div>
                        <div className="flex items-center gap-0.5 ml-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < (r.rating || 0) ? "text-amber-400 fill-amber-400" : "text-[#E5E5E5]"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#5D5D5D] leading-relaxed">{r.comment || r.text || "Sin comentario."}</p>
                      <p className="text-xs text-[#5D5D5D]/60 mt-2">{new Date(r.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <button onClick={() => deleteReview(r.id)} className="p-2 rounded-full hover:bg-red-50 text-[#5D5D5D] hover:text-red-500 transition-colors shrink-0" title="Eliminar reseña">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TRANSACCIONES ── */}
          {tab === "transactions" && (
            <div className="space-y-4">
              <SectionHeader title="Transacciones" subtitle="Historial de pagos procesados" onRefresh={() => reload("transactions")} />
              <div className={`${card} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E5E5]">
                        {["Usuario", "Tipo", "Descripción", "Monto", "Estado", "Fecha"].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#5D5D5D] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 && (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-[#5D5D5D] text-sm">Sin transacciones aún</td></tr>
                      )}
                      {transactions.map(t => (
                        <tr key={t.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#FDFBF7] transition-colors">
                          <td className="px-5 py-4 text-[#5D5D5D]">{t.user_name || "—"}</td>
                          <td className="px-5 py-4">
                            <span className={t.type === "subscription" ? badge.purple : t.type === "booking" ? badge.blue : badge.yellow}>
                              {t.type === "subscription" ? "Membresía" : t.type === "booking" ? "Reserva" : "Tienda"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[#5D5D5D] text-xs max-w-[220px] truncate">{t.description || "—"}</td>
                          <td className="px-5 py-4 font-medium text-[#2C2C2C]">${Number(t.amount || 0).toLocaleString("es-AR")}</td>
                          <td className="px-5 py-4">
                            <span className={t.status === "aprobado" ? badge.green : t.status === "rechazado" ? badge.red : badge.yellow}>{t.status}</span>
                          </td>
                          <td className="px-5 py-4 text-[#5D5D5D] text-xs">{new Date(t.created_at).toLocaleDateString("es-AR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── CONFIGURACIÓN ── */}
          {tab === "config" && (
            <div className="space-y-4">
              <SectionHeader title="Configuración" subtitle="Precios de planes y ajustes del sitio" onRefresh={() => reload("config")} />
              <div className={card}>
                {config.length === 0 && (
                  <div className="p-10 text-center text-[#5D5D5D] text-sm">Sin configuraciones disponibles</div>
                )}
                {config.map((item, idx) => (
                  <div key={item.key} className={`px-6 py-5 flex items-center justify-between gap-4 ${idx < config.length - 1 ? "border-b border-[#E5E5E5]" : ""}`}>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#2C2C2C]">{item.label || item.key}</p>
                      {editingConfig !== item.key && (
                        <p className="text-sm text-[#8CAE99] font-medium mt-0.5">
                          {item.key.includes("price") ? `$${Number(item.value).toLocaleString("es-AR")} ARS` : item.value}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingConfig === item.key ? (
                        <>
                          <input
                            className={`${input} w-44`}
                            value={configValues[item.key] || ""}
                            onChange={e => setConfigValues(v => ({ ...v, [item.key]: e.target.value }))}
                            autoFocus
                          />
                          <button onClick={() => saveConfig(item.key)} className="p-2 bg-[#8CAE99]/15 text-[#8CAE99] rounded-full hover:bg-[#8CAE99]/25 transition-colors"><Check size={15} /></button>
                          <button onClick={() => setEditingConfig(null)} className="p-2 bg-[#E5E5E5] text-[#5D5D5D] rounded-full hover:bg-gray-200 transition-colors"><X size={15} /></button>
                        </>
                      ) : (
                        <button onClick={() => setEditingConfig(item.key)} className={btn.ghost}>
                          <Edit2 size={13} /> Editar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, action, onRefresh }: { title: string; subtitle?: string; action?: React.ReactNode; onRefresh?: () => void }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-1">
      <div>
        <h2 className="text-xl font-light text-[#2C2C2C] tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-[#5D5D5D] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button onClick={onRefresh} className="p-2 rounded-full hover:bg-[#8CAE99]/10 text-[#5D5D5D] hover:text-[#8CAE99] transition-colors" title="Actualizar">
            <RefreshCw size={15} />
          </button>
        )}
        {action}
      </div>
    </div>
  );
}

// ─── TeacherForm ──────────────────────────────────────────────────────────────
function TeacherForm({ teacher, onSave, onCancel }: { teacher: any; onSave: (t: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...teacher });
  const set = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  const fields = [
    { label: "Nombre completo", key: "name", type: "text", col: 1 },
    { label: "Email", key: "email", type: "email", col: 1 },
    { label: "Teléfono", key: "phone", type: "text", col: 1 },
    { label: "Disciplina", key: "discipline", type: "text", col: 1 },
    { label: "Especialidad", key: "specialty", type: "text", col: 1 },
    { label: "Zona / Barrio", key: "location", type: "text", col: 1 },
    { label: "Precio por clase (ARS)", key: "price", type: "number", col: 1 },
    { label: "Días disponibles", key: "available_days", type: "text", col: 1 },
    { label: "URL foto de perfil", key: "photo_url", type: "text", col: 2 },
  ];

  return (
    <div className="bg-white border-2 border-[#8CAE99]/30 rounded-2xl p-6">
      <h3 className="font-medium text-[#2C2C2C] mb-5 text-base">{teacher?.id ? "Editar profesor" : "Nuevo profesor"}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {fields.filter(f => f.col === 1).map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-[#5D5D5D] mb-1.5">{f.label}</label>
            <input type={f.type} value={form[f.key] || ""} onChange={e => set(f.key, e.target.value)} className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#8CAE99] focus:ring-1 focus:ring-[#8CAE99]/30" />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[#5D5D5D] mb-1.5">URL foto de perfil</label>
          <input type="text" value={form.photo_url || ""} onChange={e => set("photo_url", e.target.value)} className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#8CAE99] focus:ring-1 focus:ring-[#8CAE99]/30" placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[#5D5D5D] mb-1.5">Biografía</label>
          <textarea value={form.bio || ""} onChange={e => set("bio", e.target.value)} className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#8CAE99] focus:ring-1 focus:ring-[#8CAE99]/30" rows={3} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#5D5D5D] mb-1.5">Plan</label>
          <select value={form.plan || "ninguno"} onChange={e => set("plan", e.target.value)} className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#8CAE99] bg-white">
            <option value="ninguno">Sin plan</option>
            <option value="inicial">Inicial</option>
            <option value="destacado">Destacado</option>
            <option value="institucional">Institucional</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#5D5D5D] mb-1.5">Estado</label>
          <select value={form.status || "activo"} onChange={e => set("status", e.target.value)} className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#8CAE99] bg-white">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={() => onSave(form)} className="inline-flex items-center gap-2 bg-[#8CAE99] hover:bg-[#7a9d88] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
          <Save size={15} /> {teacher?.id ? "Guardar cambios" : "Crear profesor"}
        </button>
        <button onClick={onCancel} className="inline-flex items-center gap-2 bg-white border border-[#E5E5E5] hover:border-[#2C2C2C] text-[#2C2C2C] px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
          <X size={15} /> Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── ProductForm ──────────────────────────────────────────────────────────────
function ProductForm({ product, onSave, onCancel }: { product: any; onSave: (p: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...product });
  const set = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }));

  return (
    <div className="bg-white border-2 border-[#8CAE99]/30 rounded-2xl p-6">
      <h3 className="font-medium text-[#2C2C2C] mb-5 text-base">{product?.id ? "Editar producto" : "Nuevo producto"}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: "Nombre", key: "name", type: "text" },
          { label: "Precio (ARS)", key: "price", type: "number" },
          { label: "Categoría", key: "category", type: "text" },
          { label: "Stock", key: "stock", type: "number" },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-[#5D5D5D] mb-1.5">{f.label}</label>
            <input type={f.type} value={form[f.key] || ""} onChange={e => set(f.key, e.target.value)} className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#8CAE99] focus:ring-1 focus:ring-[#8CAE99]/30" />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[#5D5D5D] mb-1.5">Descripción</label>
          <textarea value={form.description || ""} onChange={e => set("description", e.target.value)} className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#8CAE99] focus:ring-1 focus:ring-[#8CAE99]/30" rows={3} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[#5D5D5D] mb-1.5">URL de imagen principal</label>
          <input value={form.images?.[0] || ""} onChange={e => set("images", [e.target.value])} className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#8CAE99] focus:ring-1 focus:ring-[#8CAE99]/30" placeholder="https://..." />
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active ?? true} onChange={e => set("active", e.target.checked)} className="rounded border-[#E5E5E5] text-[#8CAE99] focus:ring-[#8CAE99]" />
            <span className="text-sm text-[#2C2C2C]">Producto activo (visible en tienda)</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={() => onSave(form)} className="inline-flex items-center gap-2 bg-[#8CAE99] hover:bg-[#7a9d88] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
          <Save size={15} /> {product?.id ? "Guardar cambios" : "Crear producto"}
        </button>
        <button onClick={onCancel} className="inline-flex items-center gap-2 bg-white border border-[#E5E5E5] hover:border-[#2C2C2C] text-[#2C2C2C] px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
          <X size={15} /> Cancelar
        </button>
      </div>
    </div>
  );
}
