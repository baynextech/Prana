import { useState } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"alumno" | "profesor" | "instituto">("alumno");
  const [isResetSent, setIsResetSent] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "forgot") {
      if (!email) return;
      setIsResetSent(true);
      return;
    }

    if (!email || !password) return;
    
    if (mode === "register") {
      login(email, name, role);
    } else {
      // Si entra como profe o instituto en el login o alumno, dejamos que use el rol de su cuenta o por defecto
      const resolvedRole = email.includes("profe") ? "profesor" : (email.includes("inst") ? "instituto" : "alumno");
      login(email, undefined, resolvedRole);
    }
    
    onClose();
  };

  const handleModeChange = (newMode: "login" | "register" | "forgot") => {
    setMode(newMode);
    setIsResetSent(false);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#5D5D5D] hover:text-[#2C2C2C] transition-colors p-2 rounded-full hover:bg-black/5"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-medium text-[#2C2C2C] mb-2">
            {mode === "login" && "¡Hola de nuevo!"}
            {mode === "register" && "Creá tu cuenta"}
            {mode === "forgot" && "Recuperá tu cuenta"}
          </h2>
          <p className="text-[#5D5D5D]">
            {mode === "login" && "Ingresá a tu cuenta para continuar"}
            {mode === "register" && "Unite a nuestra comunidad de bienestar"}
            {mode === "forgot" && !isResetSent && "Ingresá tu mail y te enviamos un link"}
            {mode === "forgot" && isResetSent && "¡Listo! Revisá tu casilla de correo"}
          </p>
        </div>

        {mode === "forgot" && isResetSent ? (
          <div className="flex flex-col gap-4">
             <button 
                onClick={() => handleModeChange("login")}
                className="w-full bg-[#8CAE99] hover:bg-[#7a9d88] text-white py-3 rounded-full font-medium transition-colors"
              >
                Volver a ingresar
             </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D5D5D]" />
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#E5E5E5] focus:border-[#8CAE99] focus:ring-1 focus:ring-[#8CAE99] text-[#2C2C2C] rounded-2xl pl-12 pr-4 py-3 outline-none transition-all placeholder:text-[#5D5D5D]/50"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 my-1">
                  <label className="text-xs font-semibold text-[#5D5D5D] uppercase tracking-wider pl-1">
                    Registrarme como:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      id="role-btn-alumno"
                      onClick={() => setRole("alumno")}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                        role === "alumno"
                          ? "bg-[#8CAE99] text-white border-[#8CAE99] shadow-sm"
                          : "bg-white text-[#5D5D5D] border-[#E5E5E5] hover:border-[#8CAE99]/50"
                      }`}
                    >
                      Alumno/a
                    </button>
                    <button
                      type="button"
                      id="role-btn-profesor"
                      onClick={() => setRole("profesor")}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                        role === "profesor"
                          ? "bg-[#8CAE99] text-white border-[#8CAE99] shadow-sm"
                          : "bg-white text-[#5D5D5D] border-[#E5E5E5] hover:border-[#8CAE99]/50"
                      }`}
                    >
                      Profesor/a
                    </button>
                    <button
                      type="button"
                      id="role-btn-instituto"
                      onClick={() => setRole("instituto")}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                        role === "instituto"
                          ? "bg-[#8CAE99] text-white border-[#8CAE99] shadow-sm"
                          : "bg-white text-[#5D5D5D] border-[#E5E5E5] hover:border-[#8CAE99]/50"
                      }`}
                    >
                      Instituto
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D5D5D]" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#E5E5E5] focus:border-[#8CAE99] focus:ring-1 focus:ring-[#8CAE99] text-[#2C2C2C] rounded-2xl pl-12 pr-4 py-3 outline-none transition-all placeholder:text-[#5D5D5D]/50"
                required
              />
            </div>

            {mode !== "forgot" && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D5D5D]" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#E5E5E5] focus:border-[#8CAE99] focus:ring-1 focus:ring-[#8CAE99] text-[#2C2C2C] rounded-2xl pl-12 pr-4 py-3 outline-none transition-all placeholder:text-[#5D5D5D]/50"
                  required
                />
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => handleModeChange("forgot")}
                  className="text-sm text-[#5D5D5D] hover:text-[#8CAE99] font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-[#8CAE99] hover:bg-[#7a9d88] text-white py-3 rounded-full font-medium transition-colors mt-2"
            >
              {mode === "login" && "Ingresar"}
              {mode === "register" && "Registrarse"}
              {mode === "forgot" && "Enviar link"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-[#5D5D5D]">
          {mode === "login" ? (
            <p>
              ¿No tenés una cuenta?{" "}
              <button type="button" onClick={() => handleModeChange("register")} className="text-[#8CAE99] font-medium hover:underline">
                Registrate ahora
              </button>
            </p>
          ) : mode === "register" ? (
            <p>
              ¿Ya tenés una cuenta?{" "}
              <button type="button" onClick={() => handleModeChange("login")} className="text-[#8CAE99] font-medium hover:underline">
                Ingresá
              </button>
            </p>
          ) : (
            <p>
               <button type="button" onClick={() => handleModeChange("login")} className="text-[#8CAE99] font-medium hover:underline">
                Volver a ingresar
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
