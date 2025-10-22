import { type FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../ui/AuthCard";
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const isValid = useMemo(
    () => email.trim().length > 0 && password.length >= 6,
    [email, password],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message =
          payload?.message ??
          "Impossible de se connecter. Verifiez vos identifiants.";
        throw new Error(Array.isArray(message) ? message.join(" ") : message);
      }

      await response.json().catch(() => ({}));
      setSuccess("Connexion reussie. Bienvenue !");
      navigate("/servers", { replace: true });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Une erreur est survenue.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AuthCard title="Connexion" subtitle="Accedez a votre espace de discussion">
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor="email"
          >
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
            placeholder="nom@exemple.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
            htmlFor="password"
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
            placeholder="Votre mot de passe"
            autoComplete="current-password"
            minLength={6}
            required
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full rounded-xl bg-green-600 px-4 py-3 text-lg font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Connexion en cours..." : "Se connecter"}
        </button>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Pas encore de compte ?{" "}
          <Link
            className="font-semibold text-green-600 hover:text-green-500"
            to="/register"
          >
            Inscrivez-vous
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
