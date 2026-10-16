import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, Award,
  Bell, BriefcaseBusiness, Check, ChevronDown,
  CircleHelp, FileCheck2, FolderKanban, GraduationCap, LayoutDashboard,
  Menu, Plus, Search, Settings, ShieldCheck, Sparkles, Target,
  TrendingUp, UserRound, X
} from "lucide-react";
import "./index.css";

type Section =
  | "Inicio" | "Mi perfil" | "Experiencias"
  | "Competencias" | "Evidencias" | "Portafolio";

type Experience = {
  id: string | number;
  title: string;
  organization: string;
  period: string;
  description: string;
  type: string;
};


function mapApiExperience(item: ApiExperience): Experience {
  const formatDate = (value: string) =>
    new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("es-CO", {
      month: "short",
      year: "numeric",
    });

  const period = item.is_current
    ? `${formatDate(item.start_date)} ? Actualidad`
    : item.end_date
      ? `${formatDate(item.start_date)} ? ${formatDate(item.end_date)}`
      : formatDate(item.start_date);

  const labels: Record<string, string> = {
    project: "Proyecto",
    work: "Laboral",
    academic: "Acad?mica",
    volunteer: "Voluntariado",
    other: "Otra",
  };

  return {
    id: item.id,
    title: item.title,
    organization: item.organization || "Sin organizaci?n",
    period,
    description: item.description || "Sin descripci?n.",
    type: labels[item.experience_type] || "Experiencia",
  };
}

const navigation: { label: Section; icon: typeof LayoutDashboard }[] = [
  { label: "Inicio", icon: LayoutDashboard },
  { label: "Mi perfil", icon: UserRound },
  { label: "Experiencias", icon: BriefcaseBusiness },
  { label: "Competencias", icon: Target },
  { label: "Evidencias", icon: FileCheck2 },
  { label: "Portafolio", icon: FolderKanban },
];

const initialExperiences: Experience[] = [
  {
    id: 1,
    title: "Desarrollo de aplicación móvil",
    organization: "Proyecto académico",
    period: "2025 — Actualidad",
    description: "Diseño de una aplicación con arquitectura limpia, gestión de estado y persistencia local.",
    type: "Proyecto",
  },
  {
    id: 2,
    title: "Plataforma de gestión de transacciones",
    organization: "Proyecto full stack",
    period: "2025",
    description: "Construcción de una solución web con frontend, API y base de datos relacional.",
    type: "Desarrollo",
  },
];

const initialSkills = [
  { name: "Desarrollo de software", category: "Técnica", level: 80 },
  { name: "Bases de datos", category: "Técnica", level: 70 },
  { name: "Resolución de problemas", category: "Transversal", level: 75 },
  { name: "Trabajo colaborativo", category: "Transversal", level: 85 },
];

import { authApi, type AuthProfile, type Experience as ApiExperience } from "./authApi";

type AppProps = {
  authenticatedEmail?: string;
  authenticatedName?: string;
  accessToken?: string;
  onProfileUpdated?: (profile: AuthProfile) => void;
  onLogout?: () => void;
};

function App({
  authenticatedEmail,
  authenticatedName,
  accessToken,
  onProfileUpdated,
  onLogout,
}: AppProps = {}) {
  const [section, setSection] = useState<Section>("Inicio");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [experiences, setExperiences] = useState(initialExperiences);
  const [skills, setSkills] = useState(initialSkills);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [experienceTitle, setExperienceTitle] = useState("");
  const [experienceOrganization, setExperienceOrganization] = useState("");
  const [skillName, setSkillName] = useState("");
  const [notice, setNotice] = useState("");

  const [profileData, setProfileData] = useState<AuthProfile | null>(null);
  const [profileForm, setProfileForm] = useState<Omit<AuthProfile, "id">>({
    display_name: authenticatedName || "",
    headline: "",
    professional_summary: "",
    location: "",
  });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState("");
  const [profileFeedbackType, setProfileFeedbackType] = useState<"success" | "error">("success");



  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    authApi.listExperiences(accessToken)
      .then((items) => {
        if (!cancelled) {
          setExperiences(items.map(mapApiExperience));
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setNotice(
            error instanceof Error
              ? `No fue posible cargar las experiencias: ${error.message}`
              : "No fue posible cargar las experiencias."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (section !== "Mi perfil" || !accessToken) return;

    let cancelled = false;

    authApi.getProfile(accessToken)
      .then((profile) => {
        if (cancelled) return;
        setProfileData(profile);
        setProfileForm({
          display_name: profile.display_name || "",
          headline: profile.headline || "",
          professional_summary: profile.professional_summary || "",
          location: profile.location || "",
        });
        setProfileLoaded(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setProfileFeedback(
          error instanceof Error
            ? error.message
            : "No fue posible cargar el perfil. Comprueba tu conexión e inténtalo de nuevo."
        );
        setProfileFeedbackType("error");
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [section, accessToken]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !profileLoaded) return;

    const name = profileForm.display_name.trim();
    if (name.length < 2) {
      setProfileFeedback("El nombre debe tener al menos 2 caracteres.");
      setProfileFeedbackType("error");
      return;
    }

    setProfileSaving(true);
    setProfileFeedback("");

    try {
      const updated = await authApi.updateProfile(accessToken, {
        display_name: name,
        headline: profileForm.headline?.trim() || null,
        professional_summary: profileForm.professional_summary?.trim() || null,
        location: profileForm.location?.trim() || null,
      });

      setProfileData(updated);
      setProfileForm({
        display_name: updated.display_name,
        headline: updated.headline || "",
        professional_summary: updated.professional_summary || "",
        location: updated.location || "",
      });
      onProfileUpdated?.(updated);
      setProfileEditing(false);
      setProfileFeedback("Perfil guardado correctamente.");
      setProfileFeedbackType("success");
    } catch (error: unknown) {
      setProfileFeedback(
        error instanceof Error
          ? error.message
          : "No fue posible guardar los cambios. Inténtalo de nuevo."
      );
      setProfileFeedbackType("error");
    } finally {
      setProfileSaving(false);
    }
  }

  const filteredExperiences = useMemo(
    () => experiences.filter((item) =>
      `${item.title} ${item.organization} ${item.description}`
        .toLowerCase().includes(query.toLowerCase())
    ),
    [experiences, query]
  );

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  async function addExperience(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = experienceTitle.trim();
    const organization = experienceOrganization.trim();

    if (!title || !organization) return;

    if (!accessToken) {
      setExperiences((current) => [{
        id: Date.now(),
        title,
        organization,
        period: "2026 ? Actualidad",
        description: "Experiencia de demostraci?n agregada desde la interfaz.",
        type: "Proyecto",
      }, ...current]);

      setExperienceTitle("");
      setExperienceOrganization("");
      setShowExperienceForm(false);
      notify("Experiencia agregada al modo de demostraci?n.");
      return;
    }

    try {
      const created = await authApi.createExperience(accessToken, {
        experience_type: "project",
        title,
        organization,
        description: null,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: null,
        is_current: true,
        visibility: "private",
      });

      setExperiences((current) => [
        mapApiExperience(created),
        ...current.filter((item) => item.id !== created.id),
      ]);

      setExperienceTitle("");
      setExperienceOrganization("");
      setShowExperienceForm(false);
      notify("Experiencia guardada correctamente.");
    } catch (error: unknown) {
      notify(
        error instanceof Error
          ? `No fue posible guardar la experiencia: ${error.message}`
          : "No fue posible guardar la experiencia."
      );
    }
  }

  function addSkill(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!skillName.trim()) return;
    if (skills.some((item) => item.name.toLowerCase() === skillName.trim().toLowerCase())) {
      notify("Esa competencia ya está en la lista.");
      return;
    }

    setSkills((current) => [
      ...current,
      { name: skillName.trim(), category: "Técnica", level: 50 },
    ]);
    setSkillName("");
    setShowSkillForm(false);
    notify("Competencia agregada a los datos de demostración.");
  }

  const pageTitles: Record<Section, string> = {
    "Inicio": "Tu desarrollo profesional, en un solo lugar",
    "Mi perfil": "Mi perfil profesional",
    "Experiencias": "Mis experiencias",
    "Competencias": "Mis competencias",
    "Evidencias": "Mis evidencias",
    "Portafolio": "Mi portafolio profesional",
  };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="mobile-overlay"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setSection("Inicio"); }}>
          <span className="brand-mark"><Activity size={23} strokeWidth={2.5} /></span>
          <span className="brand-copy">
            <strong>TRAZA</strong>
            <small>Perfil profesional</small>
          </span>
        </a>

        <div className="workspace-label">ESPACIO PERSONAL</div>

        <nav className="main-nav" aria-label="Navegación principal">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${section === label ? "nav-active" : ""}`}
              onClick={() => { setSection(label); setSidebarOpen(false); }}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Evidencias" && <span className="nav-count">3</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon"><CircleHelp size={19} /></span>
            <strong>¿Necesitas ayuda?</strong>
            <p>Organiza tus logros y demuestra tus competencias.</p>
            <button onClick={() => notify("Centro de ayuda: próximamente.")}>
              Explorar guía <ArrowRight size={14} />
            </button>
          </div>
          <button className="nav-item settings-item" onClick={() => notify("La configuración estará disponible próximamente.")}>
            <Settings size={19} /> <span>Configuración</span>
          </button>
          <div className="user-mini">
            <div className="avatar avatar-small">MA</div>
            <div className="user-mini-copy">
              <strong>{authenticatedName || "Mi perfil"}</strong>
              <small>{authenticatedEmail || "Estudiante"}</small>
            </div>
            <ChevronDown size={16} className="muted-icon" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button menu-button" aria-label="Abrir menú" onClick={() => setSidebarOpen(true)}>
              <Menu size={21} />
            </button>
            <div className="breadcrumb"><span>TRAZA</span><span className="breadcrumb-slash">/</span><strong>{section}</strong></div>
          </div>
          <div className="topbar-actions">
            <span className="environment-pill"><span /> Entorno de demostración</span>
            <button className="icon-button notification-button" aria-label="Notificaciones" onClick={() => notify("No tienes notificaciones nuevas.")}>
              <Bell size={19} /><i />
            </button>
            <div className="auth-user-chip" title={authenticatedEmail}>
              <div className="avatar">{(authenticatedName || authenticatedEmail || "U").slice(0, 2).toUpperCase()}</div>
              <span className="auth-user-email">{authenticatedName || authenticatedEmail}</span>
            </div>
            {onLogout && <button className="auth-logout-button" onClick={onLogout}>Cerrar sesión</button>}
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><Sparkles size={14} /> TU CAMINO PROFESIONAL</div>
              <h1>{section === "Inicio" ? "Hola, bienvenido a TRAZA" : pageTitles[section]}</h1>
              <p className="page-subtitle">
                {section === "Inicio"
                  ? "Construye un perfil que demuestre lo que sabes hacer."
                  : "Organiza tus logros, documenta tus aprendizajes y muestra tu potencial."}
              </p>
            </div>
            {section === "Experiencias" && (
              <button className="primary-button" onClick={() => setShowExperienceForm(true)}>
                <Plus size={17} /> Nueva experiencia
              </button>
            )}
            {section === "Competencias" && (
              <button className="primary-button" onClick={() => setShowSkillForm(true)}>
                <Plus size={17} /> Nueva competencia
              </button>
            )}
          </div>

          {section === "Inicio" && (
            <>
              <section className="welcome-banner">
                <div className="welcome-content">
                  <span className="banner-label"><Sparkles size={14} /> TU PERFIL, TU HISTORIA</span>
                  <h2>Lo que sabes hacer<br />merece ser demostrado.</h2>
                  <p>Convierte tus proyectos, experiencias y aprendizajes en un portafolio profesional basado en evidencias.</p>
                  <button className="banner-button" onClick={() => setSection("Mi perfil")}>
                    Completar mi perfil <ArrowRight size={16} />
                  </button>
                </div>
                <div className="banner-art" aria-hidden="true">
                  <div className="art-orbit orbit-one" />
                  <div className="art-orbit orbit-two" />
                  <div className="art-document">
                    <div className="art-doc-top"><span /><span /><span /></div>
                    <div className="art-avatar"><UserRound size={26} /></div>
                    <div className="art-line art-line-wide" />
                    <div className="art-line art-line-short" />
                    <div className="art-progress"><span /></div>
                    <div className="art-check"><ShieldCheck size={24} /></div>
                  </div>
                  <div className="floating-badge badge-skill"><Award size={16} /> Competencias</div>
                  <div className="floating-badge badge-verified"><Check size={16} /> Logros reales</div>
                </div>
              </section>

              <section className="metrics-grid" aria-label="Resumen de actividad">
                <MetricCard icon={BriefcaseBusiness} label="Experiencias" value={experiences.length.toString()} helper="Proyectos y aprendizajes" tone="blue" />
                <MetricCard icon={Target} label="Competencias" value={skills.length.toString()} helper="Habilidades registradas" tone="purple" />
                <MetricCard icon={FileCheck2} label="Evidencias" value="3" helper="Registros de demostración" tone="green" />
                <MetricCard icon={TrendingUp} label="Perfil completado" value="65%" helper="Sigue construyendo tu perfil" tone="orange" progress={65} />
              </section>

              <div className="content-grid">
                <section className="panel experiences-panel">
                  <div className="panel-heading">
                    <div><h3>Experiencias recientes</h3><p>Lo que has construido y aprendido</p></div>
                    <button className="text-button" onClick={() => setSection("Experiencias")}>Ver todas <ArrowRight size={15} /></button>
                  </div>
                  <div className="experience-list">
                    {experiences.slice(0, 3).map((experience) => (
                      <ExperienceRow key={experience.id} experience={experience} />
                    ))}
                  </div>
                  <button className="add-inline" onClick={() => { setSection("Experiencias"); setShowExperienceForm(true); }}>
                    <Plus size={16} /> Agregar una experiencia
                  </button>
                </section>

                <section className="panel skills-panel">
                  <div className="panel-heading">
                    <div><h3>Competencias destacadas</h3><p>Habilidades que estás desarrollando</p></div>
                    <button className="icon-button small-icon" aria-label="Ver competencias" onClick={() => setSection("Competencias")}><ArrowRight size={17} /></button>
                  </div>
                  <div className="skill-list">
                    {skills.slice(0, 4).map((skill) => (
                      <div className="skill-item" key={skill.name}>
                        <div className="skill-info"><span>{skill.name}</span><strong>{skill.level}%</strong></div>
                        <div className="progress-track"><span style={{ width: `${skill.level}%` }} /></div>
                      </div>
                    ))}
                  </div>
                  <button className="add-inline" onClick={() => { setSection("Competencias"); setShowSkillForm(true); }}>
                    <Plus size={16} /> Registrar competencia
                  </button>
                </section>
              </div>

              <section className="next-step">
                <div className="next-step-icon"><GraduationCap size={22} /></div>
                <div className="next-step-copy"><strong>Tu siguiente paso</strong><p>Adjunta evidencias a tus experiencias para demostrar tus habilidades con resultados concretos.</p></div>
                <button className="secondary-button" onClick={() => setSection("Evidencias")}>Explorar evidencias <ArrowRight size={15} /></button>
              </section>
            </>
          )}

          {section === "Mi perfil" && (
            <div className="profile-layout">
              <section className="panel profile-card">
                <div className="profile-cover"><div className="cover-orb" /></div>
                <div className="profile-details">
                  <div className="avatar avatar-profile">
                    {(profileData?.display_name || authenticatedName || "U")
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0] || "")
                      .join("")
                      .toUpperCase()}
                  </div>
                  <span className="status-label">
                    <span /> {profileLoaded ? "Perfil actualizado" : "Mi perfil profesional"}
                  </span>
                  <h2>{profileData?.display_name || authenticatedName || "Mi perfil profesional"}</h2>
                  <p className="profile-role">
                    {profileData?.headline || "Añade tu titular profesional"}
                  </p>
                  <p className="profile-description">
                    {profileData?.professional_summary || "Presenta tu trayectoria, tus intereses y los proyectos que demuestran lo que sabes hacer."}
                  </p>
                  {profileData?.location && (
                    <p className="profile-role">{profileData.location}</p>
                  )}
                  <div className="profile-tags">
                    <span>Desarrollo de software</span>
                    <span>Competencias</span>
                    <span>Aprendizaje continuo</span>
                  </div>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      setProfileFeedback("");
                      setProfileEditing(true);
                    }}
                    disabled={profileLoading || !profileLoaded}
                  >
                    Editar perfil <ArrowRight size={16} />
                  </button>
                </div>
              </section>

              <section className="panel profile-progress">
                <div className="panel-heading">
                  <div>
                    <h3>{profileEditing ? "Editar información" : "Estado del perfil"}</h3>
                    <p>{profileEditing ? "Actualiza tus datos profesionales" : "Pasos para completar tu presentación"}</p>
                  </div>
                </div>

                {profileLoading && <p role="status">Cargando perfil...</p>}

                {!profileLoading && !profileLoaded && (
                  <p role="alert" className="profile-feedback error">
                    {profileFeedback || "No se pudo cargar el perfil."}
                  </p>
                )}

                {profileLoaded && profileEditing && (
                  <form className="inline-form profile-edit-form" onSubmit={saveProfile}>
                    <label>
                      Nombre completo *
                      <input
                        required
                        minLength={2}
                        maxLength={160}
                        value={profileForm.display_name}
                        onChange={(event) => setProfileForm({ ...profileForm, display_name: event.target.value })}
                      />
                    </label>
                    <label>
                      Titular profesional
                      <input
                        maxLength={200}
                        placeholder="Ej. Desarrollador de software"
                        value={profileForm.headline || ""}
                        onChange={(event) => setProfileForm({ ...profileForm, headline: event.target.value })}
                      />
                    </label>
                    <label>
                      Ubicación
                      <input
                        maxLength={160}
                        placeholder="Ciudad, país"
                        value={profileForm.location || ""}
                        onChange={(event) => setProfileForm({ ...profileForm, location: event.target.value })}
                      />
                    </label>
                    <label>
                      Resumen profesional
                      <textarea
                        rows={5}
                        maxLength={5000}
                        placeholder="Describe tu experiencia, tus intereses y tus objetivos profesionales."
                        value={profileForm.professional_summary || ""}
                        onChange={(event) => setProfileForm({ ...profileForm, professional_summary: event.target.value })}
                      />
                    </label>
                    {profileFeedback && (
                      <p
                        role={profileFeedbackType === "error" ? "alert" : "status"}
                        className={`profile-feedback ${profileFeedbackType}`}
                      >
                        {profileFeedback}
                      </p>
                    )}
                    <div className="form-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={profileSaving}
                        onClick={() => {
                          if (profileData) {
                            setProfileForm({
                              display_name: profileData.display_name || "",
                              headline: profileData.headline || "",
                              professional_summary: profileData.professional_summary || "",
                              location: profileData.location || "",
                            });
                          }
                          setProfileEditing(false);
                          setProfileFeedback("");
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="primary-button"
                        disabled={profileSaving || !accessToken}
                      >
                        {profileSaving ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>
                  </form>
                )}

                {profileLoaded && !profileEditing && (
                  <>
                    {profileFeedback && (
                      <p role="status" className={`profile-feedback ${profileFeedbackType}`}>
                        {profileFeedback}
                      </p>
                    )}
                    {[
                      ["Información básica", Boolean(profileData?.display_name)],
                      ["Titular profesional", Boolean(profileData?.headline)],
                      ["Resumen profesional", Boolean(profileData?.professional_summary)],
                      ["Ubicación", Boolean(profileData?.location)],
                      ["Experiencias registradas", experiences.length > 0],
                      ["Competencias identificadas", skills.length > 0],
                    ].map(([label, done]) => (
                      <div className="checklist-row" key={String(label)}>
                        <span className={`check-circle ${done ? "checked" : ""}`}>
                          {done ? <Check size={14} /> : <span />}
                        </span>
                        <span>{String(label)}</span>
                        <small>{done ? "Listo" : "Pendiente"}</small>
                      </div>
                    ))}
                  </>
                )}
              </section>
            </div>
          )}

          {section === "Experiencias" && (
            <section className="panel full-panel">
              <div className="panel-heading">
                <div><h3>Trayectoria y proyectos</h3><p>Documenta experiencias académicas, laborales y personales.</p></div>
                <span className="subtle-count">{experiences.length} registros</span>
              </div>
              <div className="search-field"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar experiencias..." /></div>
              {showExperienceForm && (
                <form className="inline-form" onSubmit={addExperience}>
                  <h4>Nueva experiencia</h4>
                  <label>Nombre del proyecto o experiencia<input value={experienceTitle} onChange={(e) => setExperienceTitle(e.target.value)} required maxLength={120} placeholder="Ej. Aplicación de gestión" /></label>
                  <label>Organización o contexto<input value={experienceOrganization} onChange={(e) => setExperienceOrganization(e.target.value)} required maxLength={120} placeholder="Ej. Proyecto académico" /></label>
                  <div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowExperienceForm(false)}>Cancelar</button><button className="primary-button" type="submit"><Check size={16} /> Agregar</button></div>
                </form>
              )}
              <div className="experience-list experience-list-full">
                {filteredExperiences.map((experience) => <ExperienceRow key={experience.id} experience={experience} />)}
                {filteredExperiences.length === 0 && <div className="empty-state">No se encontraron experiencias con esa búsqueda.</div>}
              </div>
            </section>
          )}

          {section === "Competencias" && (
            <section className="panel full-panel">
              <div className="panel-heading"><div><h3>Mapa de competencias</h3><p>Identifica tus habilidades y el nivel que estás desarrollando.</p></div><span className="subtle-count">{skills.length} competencias</span></div>
              {showSkillForm && (
                <form className="inline-form" onSubmit={addSkill}>
                  <h4>Agregar competencia</h4>
                  <label>Nombre de la competencia<input value={skillName} onChange={(e) => setSkillName(e.target.value)} required maxLength={100} placeholder="Ej. Comunicación técnica" /></label>
                  <div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowSkillForm(false)}>Cancelar</button><button className="primary-button" type="submit"><Check size={16} /> Agregar</button></div>
                </form>
              )}
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <div className="skill-card" key={skill.name}>
                    <div className={`skill-card-icon skill-tone-${index % 4}`}><Target size={20} /></div>
                    <span className="skill-category">{skill.category}</span>
                    <h4>{skill.name}</h4>
                    <div className="skill-info"><span>Nivel de desarrollo</span><strong>{skill.level}%</strong></div>
                    <div className="progress-track"><span style={{ width: `${skill.level}%` }} /></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === "Evidencias" && (
            <section className="panel full-panel">
              <div className="panel-heading"><div><h3>Pruebas de tus logros</h3><p>Las evidencias permiten demostrar las competencias que desarrollaste.</p></div><button className="primary-button" onClick={() => notify("La carga de archivos se habilitará al conectar el almacenamiento.")}><Plus size={16} /> Agregar evidencia</button></div>
              <div className="notice-box"><ShieldCheck size={20} /><div><strong>Demuestra, no solo declares</strong><p>Relaciona cada evidencia con una experiencia y las competencias que demuestra.</p></div></div>
              {[
                ["Código fuente de un proyecto", "Repositorio de código", "Proyecto académico"],
                ["Documentación técnica", "Documento", "Desarrollo de software"],
                ["Capturas de la aplicación", "Imagen", "Aplicación móvil"],
              ].map(([title, kind, context], index) => (
                <div className="evidence-row" key={title}>
                  <div className={`evidence-icon evidence-${index}`}><FileCheck2 size={20} /></div>
                  <div className="evidence-copy"><strong>{title}</strong><span>{context}</span></div>
                  <span className="type-pill">{kind}</span>
                  <span className="demo-pill">Demo</span>
                </div>
              ))}
              <p className="disclaimer">Estos registros son ejemplos visuales. No representan archivos almacenados ni evidencias verificadas.</p>
            </section>
          )}

          {section === "Portafolio" && (
            <div className="portfolio-layout">
              <section className="panel portfolio-preview">
                <div className="portfolio-cover"><span className="portfolio-logo"><Activity size={22} /> TRAZA</span><span className="preview-tag">VISTA PREVIA</span></div>
                <div className="portfolio-body"><span className="eyebrow">PORTAFOLIO PROFESIONAL</span><h2>Presenta lo que sabes hacer.</h2><p>Reúne tus experiencias, competencias y evidencias en un espacio organizado para compartir tu trayectoria.</p><div className="portfolio-stats"><span><BriefcaseBusiness size={17} /> {experiences.length} experiencias</span><span><Award size={17} /> {skills.length} competencias</span></div><button className="primary-button" onClick={() => notify("La publicación estará disponible cuando se implemente el backend.")}>Preparar publicación <ArrowRight size={16} /></button></div>
              </section>
              <section className="panel publish-panel"><div className="publish-icon"><ShieldCheck size={23} /></div><h3>Tu portafolio, bajo tu control</h3><p>Antes de publicar podrás revisar qué información y evidencias quieres compartir.</p><div className="publish-status"><span /> No publicado</div><div className="privacy-note">La publicación real y los permisos de visibilidad todavía no están conectados al backend.</div></section>
            </div>
          )}

          <footer className="page-footer"><span>© 2026 TRAZA · Perfil profesional basado en evidencias</span><span><ShieldCheck size={14} /> Privacidad desde el diseño</span></footer>
        </div>
      </main>

      {notice && <div className="toast" role="status"><Check size={17} /> {notice}<button aria-label="Cerrar aviso" onClick={() => setNotice("")}><X size={15} /></button></div>}
    </div>
  );
}

function MetricCard({
  icon: Icon, label, value, helper, tone, progress,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
  helper: string;
  tone: string;
  progress?: number;
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon tone-${tone}`}><Icon size={20} strokeWidth={1.9} /></div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-helper">{helper}</div>
      {progress !== undefined && <div className="progress-track metric-progress"><span style={{ width: `${progress}%` }} /></div>}
    </article>
  );
}

function ExperienceRow({ experience }: { experience: Experience }) {
  return (
    <article className="experience-row">
      <div className="experience-icon"><FolderKanban size={19} /></div>
      <div className="experience-copy">
        <h4>{experience.title}</h4>
        <p>{experience.organization} <span>·</span> {experience.period}</p>
        <div className="experience-description">{experience.description}</div>
      </div>
      <span className="experience-type">{experience.type}</span>
      <ArrowDownRight size={17} className="experience-arrow" />
    </article>
  );
}

export default App;
