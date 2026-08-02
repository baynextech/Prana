import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, DollarSign, TrendingUp, Package, Settings, ChevronRight, Edit2, Trash2, Plus, Save, X, Check } from "lucide-react";

const API = (token: string) => ({
  get: (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  post: (url: string, body: any) => fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
  put: (url: string, body: any) => fetch(url, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
  del: (url: string) => fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
});

type Tab = "dashboard" | "teachers" | "products" | "users" | "transactions" | "config";

export function AdminPanel() {
  const { isAdmin, token, profile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [dashboard, setDashboard] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [config, setConfig] = useState<any[]>([]);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate("/perfil"); return; }
    loadTab("dashboard");
  }, [isAdmin]);

  useEffect(() => { loadTab(tab); }, [tab]);

  const api = API(token!);

  const loadTab = async (t: Tab) => {
    if (t === "dashboard" && !dashboard) setDashboard(await api.get("/api/admin/dashboard"));
    if (t === "teachers" && !teachers.length) setTeachers(await api.get("/api/admin/teachers"));
    if (t === "products" && !products.length) setProducts(await api.get("/api/admin/products"));
    if (t === "users" && !users.length) setUsers(await api.get("/api/admin/users"));
    if (t === "transactions" && !transactions.length) setTransactions(await api.get("/api/admin/transactions"));
    if (t === "config" && !config.length) {
      const data = await api.get("/api/admin/config");
      setConfig(data);
      setConfigValues(Object.fromEntries(data.map((c: any) => [c.key, c.value])));
    }
  };

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
    if (!confirm("¿Eliminar este profesor?")) return;
    await api.del(`/api/admin/teachers/${id}`);
    setTeachers(ts => ts.filter(t => t.id !== id));
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
    setProducts(ps => ps.filter(p => p.id !== id));
  };

  const changeUserRole = async (id: string, role: string) => {
    await api.put(`/api/admin/users/${id}/role`, { role });
    setUsers(us => us.map(u => u.id === id ? { ...u, role } : u));
  };

  if (!isAdmin) return null;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "teachers", label: "Profesores", icon: Users },
    { id: "products", label: "Productos", icon: Package },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "transactions", label: "Transacciones", icon: DollarSign },
    { id: "config", label: "Configuración", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel Admin</h1>
            <p className="text-sm text-gray-500">Hola, {profile?.name}</p>
          </div>
          <button onClick={() => navigate("/")} className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
            Ver sitio <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-56 shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${tab === t.id ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <t.icon size={18} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* DASHBOARD */}
          {tab === "dashboard" && dashboard && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Usuarios", value: dashboard.totalUsers || 0, icon: Users, color: "blue" },
                  { label: "Profesores activos", value: dashboard.totalTeachers || 0, icon: BookOpen, color: "green" },
                  { label: "Reservas", value: dashboard.totalBookings || 0, icon: TrendingUp, color: "purple" },
                  { label: "Revenue total", value: `$${(dashboard.revenue || 0).toLocaleString("es-AR")}`, icon: DollarSign, color: "yellow" },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">Revenue por tipo</h3>
                  {[
                    { label: "Membresías", value: dashboard.revenueByType?.subscriptions || 0 },
                    { label: "Reservas", value: dashboard.revenueByType?.bookings || 0 },
                    { label: "Tienda", value: dashboard.revenueByType?.products || 0 },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="font-medium text-gray-900">${item.value.toLocaleString("es-AR")}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">Últimos usuarios</h3>
                  {(dashboard.recentUsers || []).map((u: any) => (
                    <div key={u.email} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{u.name || u.email}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-red-100 text-red-700" : u.role === "profesor" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TEACHERS */}
          {tab === "teachers" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Profesores ({teachers.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Nombre", "Disciplina", "Zona", "Plan", "Estado", "Acciones"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teachers.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                        <td className="px-4 py-3 text-gray-600">{t.discipline}</td>
                        <td className="px-4 py-3 text-gray-600">{t.location}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${t.plan_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{t.plan}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${t.status === "activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{t.status}</span>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => toggleTeacherStatus(t.id, t.status)} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">
                            {t.status === "activo" ? "Desactivar" : "Activar"}
                          </button>
                          <button onClick={() => deleteTeacher(t.id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {tab === "products" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-900">Productos ({products.length})</h2>
                <button onClick={() => { setNewProduct(true); setEditingProduct({ name: "", description: "", price: "", category: "accesorios", stock: 999, active: true, images: [], features: [] }); }} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
                  <Plus size={16} /> Nuevo producto
                </button>
              </div>

              {(editingProduct || newProduct) && (
                <ProductForm product={editingProduct} onSave={saveProduct} onCancel={() => { setEditingProduct(null); setNewProduct(false); }} />
              )}

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Nombre", "Categoría", "Precio", "Stock", "Estado", "Acciones"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-3 text-gray-600">{p.category}</td>
                        <td className="px-4 py-3 font-medium text-emerald-700">${Number(p.price).toLocaleString("es-AR")}</td>
                        <td className="px-4 py-3 text-gray-600">{p.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{p.active ? "Activo" : "Inactivo"}</span>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => setEditingProduct(p)} className="text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600">
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS */}
          {tab === "users" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Usuarios ({users.length})</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Nombre", "Email", "Rol", "Registrado", "Cambiar rol"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${u.role === "admin" ? "bg-red-100 text-red-700" : u.role === "profesor" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString("es-AR")}</td>
                      <td className="px-4 py-3">
                        <select value={u.role} onChange={e => changeUserRole(u.id, e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1">
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
          )}

          {/* TRANSACTIONS */}
          {tab === "transactions" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Transacciones ({transactions.length})</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Usuario", "Tipo", "Descripción", "Monto", "Estado", "Fecha"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{t.user_name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${t.type === "subscription" ? "bg-purple-100 text-purple-700" : t.type === "booking" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>{t.type}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{t.description}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">${Number(t.amount || 0).toLocaleString("es-AR")}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${t.status === "aprobado" ? "bg-green-100 text-green-700" : t.status === "rechazado" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(t.created_at).toLocaleDateString("es-AR")}</td>
                    </tr>
                  ))}
                  {!transactions.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin transacciones aún</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* CONFIG */}
          {tab === "config" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Configuración general</h2>
                <p className="text-xs text-gray-500 mt-1">Precios de planes y ajustes del sitio</p>
              </div>
              <div className="divide-y divide-gray-100">
                {config.map(item => (
                  <div key={item.key} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.label || item.key}</p>
                      {editingConfig !== item.key && <p className="text-sm text-gray-500 mt-0.5">{item.key.includes("price") ? `$${Number(item.value).toLocaleString("es-AR")}` : item.value}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingConfig === item.key ? (
                        <>
                          <input
                            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40"
                            value={configValues[item.key] || ""}
                            onChange={e => setConfigValues(v => ({ ...v, [item.key]: e.target.value }))}
                          />
                          <button onClick={() => saveConfig(item.key)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"><Check size={16} /></button>
                          <button onClick={() => setEditingConfig(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"><X size={16} /></button>
                        </>
                      ) : (
                        <button onClick={() => setEditingConfig(item.key)} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          <Edit2 size={14} /> Editar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }: { product: any; onSave: (p: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...product });
  return (
    <div className="bg-white rounded-xl border-2 border-emerald-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{product?.id ? "Editar producto" : "Nuevo producto"}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: "Nombre", key: "name", type: "text" },
          { label: "Precio (ARS)", key: "price", type: "number" },
          { label: "Categoría", key: "category", type: "text" },
          { label: "Stock", key: "stock", type: "number" },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
            <input type={f.type} value={form[f.key] || ""} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
          <textarea value={form.description || ""} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">URL de imagen</label>
          <input value={form.images?.[0] || ""} onChange={e => setForm((p: any) => ({ ...p, images: [e.target.value] }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={() => onSave(form)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
          <Save size={16} /> Guardar
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
      </div>
    </div>
  );
}
