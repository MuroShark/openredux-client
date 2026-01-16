import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../store/useAuthStore";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (code) {
      // Передаем код и текущий origin (нужен бэкенду для валидации redirect_uri)
      const redirectUri = `${window.location.origin}/auth/discord/callback`;
      login('discord', { code, redirectUri })
        .then(() => navigate({ to: "/" }))
        .catch((err) => {
          console.error(err);
          navigate({ to: "/" });
        });
    } else if (error) {
      navigate({ to: "/" });
    }
  }, [login, navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#1e1e1e]">
      <i className="ph-bold ph-spinner animate-spin text-4xl text-[#5865F2]"></i>
    </div>
  );
}