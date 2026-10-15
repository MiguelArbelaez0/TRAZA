export type AuthUser = {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
};

export type AuthProfile = {
  id: string;
  display_name: string;
  headline: string | null;
  professional_summary: string | null;
  location: string | null;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
  profile: AuthProfile;
};

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

async function request<T>(
  path: string,
  body?: Record<string, string | null>,
  token?: string,
  method: "GET" | "POST" | "PATCH" = body ? "POST" : "GET",
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `Error HTTP ${response.status} al procesar la solicitud.`;

      try {
        const data = await response.json();

        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          message = data.detail
            .map((item: { msg?: string }) => item.msg || "Dato inválido")
            .join(" ");
        }
      } catch {
        // Conserva el mensaje HTTP si la respuesta no contiene JSON.
      }

      throw new Error(message);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "La API tardó más de 15 segundos en responder. Revisa la terminal del backend.",
        { cause: error },
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con TRAZA. Comprueba que la API esté ejecutándose.",
        { cause: error },
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const authApi = {
  register(email: string, password: string, displayName: string) {
    return request<AuthResponse>("/api/auth/register", {
      email: email.trim().toLowerCase(),
      password,
      display_name: displayName.trim(),
    });
  },

  login(email: string, password: string) {
    return request<AuthResponse>("/api/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });
  },

  me(token: string) {
    return request<AuthResponse>("/api/auth/me", undefined, token);
  },

  getProfile(token: string) {
    return request<AuthProfile>("/api/profile/me", undefined, token);
  },

  updateProfile(token: string, profile: Omit<AuthProfile, "id">) {
    return request<AuthProfile>("/api/profile/me", profile, token, "PATCH");
  },
};
