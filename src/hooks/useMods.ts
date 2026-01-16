import { useQuery } from "@tanstack/react-query";
import { Mod } from "../data/mods";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const useMods = (searchQuery: string = "") => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["mods", searchQuery], // Уникальный ключ для кэширования (зависит от поиска)
    queryFn: async () => {
      const url = new URL(`${API_URL}/api/mods`);
      if (searchQuery) {
        url.searchParams.set("q", searchQuery);
      }
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("Could not connect to backend services.");
      }
      return res.json() as Promise<Mod[]>;
    },
    retry: 3, // Количество повторных попыток при ошибке
    staleTime: 1000 * 60 * 5, // Данные считаются свежими 5 минут (не будет лишних запросов)
  });

  return {
    mods: data || [],
    isLoading,
    error: error ? error.message : null,
  };
};

export const useUserMods = () => {
  const { accessToken, isAuthenticated } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-mods"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/user/mods`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user mods");
      return res.json() as Promise<Mod[]>;
    },
    enabled: isAuthenticated && !!accessToken,
    staleTime: 0, // Всегда свежие данные для статусов
  });

  return {
    mods: data || [],
    isLoading,
    error: error ? error.message : null,
  };
};

export const useMod = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["mod", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/mods/${id}`);
      if (!res.ok) {
        throw new Error("Could not fetch mod details.");
      }
      return res.json() as Promise<Mod>;
    },
    enabled: !!id, // Запрос идет только если есть ID
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });

  return {
    mod: data,
    isLoading,
    error: error ? error.message : null,
  };
};