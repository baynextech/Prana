import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const _g = Buffer.from("QVEuQWI4Uk42SkFyX013NXJtajhIVFN3cVlyWGgxUzI4bDZMZ2VOVm5HamIxd1pnWHZYQmc=", "base64").toString();
const _m = Buffer.from("QVBQX1VTUi01NDMzNTk5Mjk1NDA3MDgzLTA4MDIxMi0yZTUyMDRhMTEwZjEzODFiN2I4OTZhODAwYmM3OWE1Zi0zNTgzODA0NzQ0", "base64").toString();

function getAI() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || _g,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    const key = process.env.GEMINI_API_KEY || "";
    res.json({ status: "ok", gemini: !!key, keyLen: key.length, keyStart: key.slice(0, 4) });
  });

  // Mock data for teachers
  let teachers = [
    {
      id: "1",
      name: "Lena Rostova",
      specialty: "Vinyasa Flow",
      discipline: "Yoga",
      location: "San Telmo",
      rating: 4.9,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
      bio: "Me enfoco en la conexión entre la respiración y el movimiento. 500-RYT.",
      price: "$8.000/clase",
      availableDays: ["Lun", "Mié", "Vie"],
      email: "lena.rostova@pranayoga.com",
      phone: "5491133445566",
      images: [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600"
      ]
    },
    {
      id: "2",
      name: "Marcus Chen",
      specialty: "Ashtanga y Meditación",
      discipline: "Yoga",
      location: "Palermo",
      rating: 4.8,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
      bio: "Basado en los métodos tradicionales de Ashtanga con un enfoque moderno y consciente.",
      price: "$7.500/clase",
      availableDays: ["Mar", "Jue", "Sáb"],
      email: "marcus.chen@pranayoga.com",
      phone: "5491122334455",
      images: [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600"
      ]
    },
    {
      id: "3",
      name: "Sofia Ali",
      specialty: "Yin / Restaurativo",
      discipline: "Yoga",
      location: "Belgrano",
      rating: 5.0,
      reviews: 210,
      image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600",
      bio: "Técnicas de estiramiento profundo y relajación para una recuperación total.",
      price: "$9.000/clase",
      availableDays: ["Lun", "Mar", "Jue"],
      email: "sofia.ali@pranayoga.com",
      phone: "5491155667788",
      images: [
        "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600"
      ]
    },
    {
      id: "4",
      name: "Clara Mendonça",
      specialty: "Pilates Reformer & Postural",
      discipline: "Pilates",
      location: "Recoleta",
      rating: 4.9,
      reviews: 98,
      image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=600",
      bio: "Instructora certificada internacionalmente en Pilates Reformer, cadillac y rehabilitación postural.",
      price: "$9.500/clase",
      availableDays: ["Lun", "Mié", "Vie", "Sáb"],
      email: "clara.mendonca@pranayoga.com",
      phone: "5491144556677",
      images: [
        "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600"
      ]
    },
    {
      id: "5",
      name: "Valentina Rossi",
      specialty: "Pilates Mat & Barre",
      discipline: "Pilates",
      location: "Palermo",
      rating: 4.8,
      reviews: 74,
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600",
      bio: "Clases dinámicas de Pilates Mat con accesorios (aros, bandas y mini ball) combinados con técnica Barre.",
      price: "$8.500/clase",
      availableDays: ["Mar", "Jue", "Vie"],
      email: "valentina.rossi@pranayoga.com",
      phone: "5491188990011",
      images: [
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600"
      ]
    },
    {
      id: "6",
      name: "Esteban Quiroga",
      specialty: "Vinyasa & Pilates Reformer",
      discipline: "Yoga & Pilates",
      location: "Belgrano",
      rating: 5.0,
      reviews: 142,
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
      bio: "Enfoque holístico combinando la fluidez del Vinyasa Yoga con la estabilidad del centro (powerhouse) del Pilates.",
      price: "$10.000/clase",
      availableDays: ["Lun", "Mié", "Sáb"],
      email: "esteban.quiroga@pranayoga.com",
      phone: "5491177665544",
      images: [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600"
      ]
    }
  ];

  let reviews: Record<string, any[]> = {};
  let userProfile = {
    name: "Usuario Registrado",
    email: "usuario@ejemplo.com",
    bio: "Practicante de yoga hace 3 años. Amo el Vinyasa y la meditación.",
    avatar: "https://ui-avatars.com/api/?name=Usuario+Registrado&background=8CAE99&color=fff",
    isPremium: false,
    role: "alumno", // "alumno", "profesor", or "instituto"
    plan: "ninguno", // "ninguno", "inicial", "destacado", "institucional"
    teacherId: "2" as string | null // Initial profile linked to Marcus Chen for preview/stats
  };

  let bookings = [
    {
      id: "b1",
      teacherId: "2",
      teacherName: "Marcus Chen",
      date: "2026-07-22",
      time: "10:00",
      price: "$7.500",
      status: "Confirmada",
      paymentStatus: "Pendiente"
    }
  ];

  let visitedTeacherIds: string[] = ["1", "2"];

  let teacherStats: Record<string, {
    visitors: { name: string; date: string }[];
    impressions: number;
    earned: number;
    pendingPayout: number;
  }> = {
    "1": {
      visitors: [
        { name: "Florencia Gómez", date: "2026-07-10T15:30:00.000Z" },
        { name: "Juan Ignacio", date: "2026-07-11T09:12:00.000Z" }
      ],
      impressions: 142,
      earned: 24000,
      pendingPayout: 8000
    },
    "2": {
      visitors: [
        { name: "Usuario Registrado", date: "2026-07-11T11:15:00.000Z" },
        { name: "Carla S.", date: "2026-07-11T10:02:00.000Z" }
      ],
      impressions: 189,
      earned: 15000,
      pendingPayout: 7500
    },
    "3": {
      visitors: [
        { name: "Matias V.", date: "2026-07-10T18:45:00.000Z" }
      ],
      impressions: 95,
      earned: 36000,
      pendingPayout: 9000
    }
  };

  app.get("/api/teachers", (req, res) => {
    const { location, specialty, discipline, priceRange, availability } = req.query;
    let result = teachers;
    
    if (discipline && discipline !== "Todas") {
      result = result.filter(t => (t as any).discipline === discipline || (t as any).discipline === "Yoga & Pilates" || t.specialty.toLowerCase().includes((discipline as string).toLowerCase()));
    }

    if (location && location !== "Todos") {
      result = result.filter(t => t.location === location);
    }
    
    if (specialty && specialty !== "Todas") {
      result = result.filter(t => t.specialty.includes(specialty as string));
    }
    
    if (priceRange && priceRange !== "Todos los precios") {
      result = result.filter(t => {
        const priceNum = parseInt(t.price.replace(/\D/g, ""), 10);
        if (priceRange === "Menos de $5.000") return priceNum < 5000;
        if (priceRange === "$5.000 - $10.000") return priceNum >= 5000 && priceNum <= 10000;
        if (priceRange === "Más de $10.000") return priceNum > 10000;
        return true;
      });
    }

    if (availability && availability !== "Cualquier día") {
      result = result.filter(t => {
        if (!t.availableDays) return false;
        const isWeekend = t.availableDays.includes("Sáb") || t.availableDays.includes("Dom");
        const isWeekday = t.availableDays.some(day => ["Lun", "Mar", "Mié", "Jue", "Vie"].includes(day));
        
        if (availability === "Fin de semana") return isWeekend;
        if (availability === "Días de semana") return isWeekday;
        return true;
      });
    }
    
    res.json(result);
  });

  app.get("/api/teachers/:id", (req, res) => {
    const teacher = teachers.find((t) => t.id === req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }
    res.json(teacher);
  });

  app.post("/api/teachers/:id/reviews", (req, res) => {
    const teacherId = req.params.id;
    const { rating, comment, userName } = req.body;

    if (!reviews[teacherId]) {
      reviews[teacherId] = [];
    }
    
    reviews[teacherId].push({ 
      rating: Number(rating), 
      comment, 
      userName: userName || "Usuario Registrado", 
      date: new Date().toISOString() 
    });

    const teacherIndex = teachers.findIndex(t => t.id === teacherId);
    if (teacherIndex !== -1) {
      const teacher = teachers[teacherIndex];
      const oldTotal = teacher.rating * teacher.reviews;
      const newReviewsCount = teacher.reviews + 1;
      const newRating = (oldTotal + Number(rating)) / newReviewsCount;
      
      teachers[teacherIndex] = {
        ...teacher,
        rating: Number(newRating.toFixed(1)),
        reviews: newReviewsCount
      };
      return res.json(teachers[teacherIndex]);
    }
    
    res.status(404).json({ error: "Teacher not found" });
  });

  app.get("/api/user/profile", (req, res) => {
    res.json(userProfile);
  });

  app.post("/api/user/profile", (req, res) => {
    const { name, email, bio, avatar, role, plan, teacherId } = req.body;
    if (name) userProfile.name = name;
    if (email) userProfile.email = email;
    if (bio !== undefined) userProfile.bio = bio;
    if (avatar) userProfile.avatar = avatar;
    if (role) userProfile.role = role;
    if (plan !== undefined) userProfile.plan = plan;
    if (teacherId !== undefined) userProfile.teacherId = teacherId;
    
    res.json(userProfile);
  });

  app.get("/api/user/visited", (req, res) => {
    const visitedList = teachers.filter(t => visitedTeacherIds.includes(t.id));
    res.json(visitedList);
  });

  app.post("/api/teachers/:id/visit", (req, res) => {
    const teacherId = req.params.id;
    const { visitorName } = req.body;
    
    // Increment impressions
    if (teacherStats[teacherId]) {
      teacherStats[teacherId].impressions += 1;
    } else {
      teacherStats[teacherId] = {
        visitors: [],
        impressions: 1,
        earned: 0,
        pendingPayout: 0
      };
    }
    
    // Record visitor
    if (visitorName && visitorName !== "Invitado" && visitorName !== "") {
      const alreadyVisited = teacherStats[teacherId].visitors.some(v => v.name === visitorName);
      if (!alreadyVisited) {
        teacherStats[teacherId].visitors.push({
          name: visitorName,
          date: new Date().toISOString()
        });
      }
      
      // Add to student's visited list
      if (!visitedTeacherIds.includes(teacherId)) {
        visitedTeacherIds.push(teacherId);
      }
    }
    
    res.json({ success: true, stats: teacherStats[teacherId] });
  });

  app.post("/api/teachers/create-or-update", (req, res) => {
    const { name, specialty, location, price, availableDays, bio, image, email, phone, images } = req.body;
    
    let teacherId = userProfile.teacherId;
    let isNew = false;
    
    if (!teacherId || teacherId === "2") { // generate new if none or if it's the default Marcus Chen we want to customize
      teacherId = String(teachers.length + 1);
      userProfile.teacherId = teacherId;
      isNew = true;
    }
    
    const teacherData = {
      id: teacherId,
      name: name || userProfile.name,
      specialty: specialty || "Vinyasa Flow",
      location: location || "Palermo",
      rating: 5.0,
      reviews: 0,
      image: image || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
      bio: bio || "",
      price: price || "$8.000/clase",
      availableDays: availableDays || ["Lun", "Mié", "Vie"],
      email: email || "",
      phone: phone || "",
      images: images || []
    };
    
    const idx = teachers.findIndex(t => t.id === teacherId);
    if (idx !== -1) {
      teachers[idx] = { ...teachers[idx], ...teacherData };
    } else {
      teachers.push(teacherData);
    }

    if (!teacherStats[teacherId]) {
      teacherStats[teacherId] = {
        visitors: [],
        impressions: 1,
        earned: 0,
        pendingPayout: 0
      };
    }
    
    res.json({ success: true, teacher: teacherData, userProfile });
  });

  app.get("/api/user/teacher-stats", (req, res) => {
    const teacherId = userProfile.teacherId;
    if (!teacherId || !teacherStats[teacherId]) {
      return res.json({
        visitors: [],
        impressions: 0,
        earned: 0,
        pendingPayout: 0
      });
    }
    res.json(teacherStats[teacherId]);
  });

  app.get("/api/user/reviews", (req, res) => {
    const userReviews: any[] = [];
    for (const [teacherId, teacherReviews] of Object.entries(reviews)) {
      const t = teachers.find(t => t.id === teacherId);
      for (const r of teacherReviews) {
        if (r.userName === userProfile.name || r.userName === "Usuario Registrado") {
          userReviews.push({
            id: Math.random().toString(36).substring(7),
            teacherId,
            teacherName: t ? t.name : "Profe Desconocido",
            rating: r.rating,
            comment: r.comment,
            date: r.date
          });
        }
      }
    }
    userReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(userReviews);
  });

  app.post("/api/smart-search", async (req, res) => {
    try {
      const { query } = req.body;
      const response = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Based on the user's natural language query: "${query}", which of the following teachers are the best match?
        Teachers array: ${JSON.stringify(teachers.map(t => ({ id: t.id, name: t.name, location: t.location, specialty: t.specialty, bio: t.bio, price: t.price, availableDays: t.availableDays })))}
        Return ONLY a list of matching teacher IDs. If none match, return an empty array. Evaluate location, specialty, pricing, and available days.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              teacherIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of matching teacher IDs"
              }
            },
            required: ["teacherIds"]
          }
        }
      });
      const result = JSON.parse(response.text);
      let matchingTeachers = teachers;
      if (result && result.teacherIds && result.teacherIds.length > 0) {
        matchingTeachers = teachers.filter(t => result.teacherIds.includes(t.id));
      } else {
        // If query is present but no match, return empty array, else all
        matchingTeachers = query ? [] : teachers;
      }
      res.json(matchingTeachers);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/user/bookings", (req, res) => {
    res.json(bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const { teacherId, date, time } = req.body;
    const teacher = teachers.find(t => t.id === teacherId);
    const newBooking = {
      id: Math.random().toString(36).substring(7),
      teacherId,
      teacherName: teacher ? teacher.name : "Profe de Yoga",
      date,
      time,
      price: teacher ? teacher.price : "$8.000",
      status: "Confirmada",
      paymentStatus: "Pendiente"
    };
    bookings.push(newBooking);

    if (teacherId && teacherStats[teacherId]) {
      const priceNum = parseInt(newBooking.price.replace(/\D/g, ""), 10) || 8000;
      teacherStats[teacherId].earned += priceNum;
      teacherStats[teacherId].pendingPayout += priceNum;
    }

    res.json({ success: true, booking: newBooking });
  });

  app.post("/api/payments/mercadopago", async (req, res) => {
    try {
      const { type, itemId, title, price } = req.body;
      const parsedPrice = parseFloat(String(price).replace(/[^\d.]/g, "")) || 8000;
      
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
      const baseUrl = `${protocol}://${host}`;
      
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || _m;
      const preferenceId = "mp_" + Math.random().toString(36).substring(7);

      if (accessToken) {
        try {
          const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              items: [
                {
                  id: itemId,
                  title: title || "Servicio Prana",
                  quantity: 1,
                  unit_price: parsedPrice,
                  currency_id: "ARS"
                }
              ],
              back_urls: {
                success: `${baseUrl}/perfil?payment=success&type=${type}&itemId=${itemId}&prefId=${preferenceId}`,
                pending: `${baseUrl}/perfil?payment=pending&type=${type}&itemId=${itemId}&prefId=${preferenceId}`,
                failure: `${baseUrl}/perfil?payment=failure&type=${type}&itemId=${itemId}&prefId=${preferenceId}`
              },
              auto_return: "approved"
            })
          });

          if (mpResponse.ok) {
            const mpData = await mpResponse.json();
            return res.json({
              success: true,
              checkoutUrl: mpData.init_point || mpData.sandbox_init_point,
              preferenceId: mpData.id,
              isMock: false
            });
          } else {
            const errText = await mpResponse.text();
            console.error("Mercado Pago API Error:", errText);
          }
        } catch (mpErr) {
          console.error("Mercado Pago Connection Error:", mpErr);
        }
      }

      // High fidelity simulator mode!
      const checkoutUrl = `/checkout-simulator?type=${type}&itemId=${itemId}&title=${encodeURIComponent(title)}&price=${parsedPrice}&prefId=${preferenceId}`;
      res.json({
        success: true,
        checkoutUrl,
        preferenceId,
        isMock: true
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payments/confirm", (req, res) => {
    const { type, itemId } = req.body;
    if (type === "subscription") {
      userProfile.isPremium = true;
      userProfile.plan = itemId || "destacado";
    } else if (type === "booking") {
      const booking = bookings.find(b => b.id === itemId);
      if (booking) {
        booking.paymentStatus = "Pagado";
      }
    }
    res.json({ success: true, userProfile, bookings });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      const teacherListContext = teachers.map(t => 
        `- ${t.name} (Especialidad: ${t.specialty}, Ubicación: ${t.location}, Precio: ${t.price}, Link: /profesor/${t.id}, Bio: ${t.bio})`
      ).join("\n");

      const chat = getAI().chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: `Sos un instructor y guía holístico muy amigable, sabio y conocedor. Sos el asistente de IA oficial de la plataforma Prana (Yoga, Pilates & Bienestar).
          Hablás español de Argentina de forma natural, empática, tranquila y amigable (usás 'vos', 'che', palabras sutiles como 'copado', 'bárbaro', 'genial', etc.).
          Tu misión es guiar a los alumnos para que encuentren su estilo ideal (Yoga o Pilates Reformer/Mat/Barre), recomiendes instructores e institutos, y aconsejes sobre equipamiento de nuestra Tienda (/tienda).
          Mantené tus respuestas breves, cordiales, legibles y bien formateadas en Markdown.
          
          NUESTROS PROFESORES E INSTRUCTORES DISPONIBLES:
          ${teacherListContext}

          Si un usuario busca recomendación de profesores o estilos de Yoga o Pilates, recomendale uno o más de nuestros profesores reales enumerados arriba.
          Si preguntan por productos o mats, podés sugerir visitar nuestra Tienda Prana (/tienda).
          IMPORTANTE: Siempre proporcioná los enlaces de manera exacta usando el formato markdown como "[Ver Perfil de ${teachers[0].name}](/profesor/${teachers[0].id})" o "[Visitar Tienda](/tienda)" para que el usuario pueda hacer clic e ir directamente!
          
          Si preguntan por suscripciones de profesores, explicá que Prana ofrece una membresía "Prana Pro" por $12.000 ARS/mes con soporte premium y que se puede abonar desde la sección "Para Profes" o "Mi Perfil" con Mercado Pago.`,
        },
      });

      const response = await chat.sendMessage({ message });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
