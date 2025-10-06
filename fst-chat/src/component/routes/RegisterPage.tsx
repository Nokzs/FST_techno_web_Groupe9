import { type FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AuthCard } from "../ui/AuthCard";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export function RegisterPage() {
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isValid = useMemo(() => {
    return (
      pseudo.trim().length >= 3 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      password === confirmPassword
    );
  }, [pseudo, email, password, confirmPassword]);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          pseudo: pseudo.trim(),
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.message ?? "Impossible de creer le compte.";
        throw new Error(Array.isArray(message) ? message.join(" ") : message);
      }

      await response.json().catch(() => ({}));
      setSuccess("Compte cree avec succes. Vous pouvez vous connecter.");
      setPseudo("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Une erreur est survenue.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AuthCard title="Inscription" subtitle="Creez votre compte pour rejoindre la discussion">
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="pseudo">
            Pseudo
          </label>
          <input
            id="pseudo"
            type="text"
            value={pseudo}
            onChange={(event) => setPseudo(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
            placeholder="Choisissez un pseudo"
            minLength={3}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="email">
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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
            placeholder="Au moins 6 caracteres"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="confirmPassword">
            Confirmez le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
            placeholder="Repetez le mot de passe"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full rounded-xl bg-green-600 px-4 py-3 text-lg font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creation en cours..." : "Creer mon compte"}
        </button>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Deja inscrit ? {" "}
          <Link className="font-semibold text-green-600 hover:text-green-500" to="/login">
            Connectez-vous
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
