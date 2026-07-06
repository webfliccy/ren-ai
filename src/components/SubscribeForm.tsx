"use client";
import { useState } from "react";

interface Props {
  formClass: string;
  inputClass: string;
  buttonClass: string;
  source?: string;
}

type State = "idle" | "loading" | "done" | "error";

export default function SubscribeForm({
  formClass,
  inputClass,
  buttonClass,
  source = "homepage",
}: Props) {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading" || state === "done") return;
    setState("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: honeypot, source }),
      });

      if (!res.ok && res.status !== 201) {
        setState("error");
        return;
      }

      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <>
        <h3>You&rsquo;re in.</h3>
        <p>The next dispatch will find you when it&rsquo;s ready.</p>
      </>
    );
  }

  const label =
    state === "loading"
      ? "Logging…"
      : state === "error"
        ? "Try again"
        : "Sign the register";

  return (
    <>
      <h3 className="mb-2 font-cormorant text-[40px] leading-[1.05] font-semibold">
        Get each issue, footnotes and all.
      </h3>
      <p className="mx-auto mb-6 max-w-[550px] font-newsreader text-[17px] leading-[1.5] text-ink-light italic">
        One dispatch when there&apos;s something worth saying — never on a
        schedule, always with receipts. Unsubscribing is one click and no hard
        feelings.
      </p>
      <form className={formClass} onSubmit={handleSubmit}>
        {/* Honeypot: hidden from real users, bots fill it in */}
        <div
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
        >
          <label htmlFor="subscribe-website">Website</label>
          <input
            id="subscribe-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
        <input
          type="email"
          placeholder="you@somewhere.real"
          aria-label="Email address"
          required
          disabled={state === "loading"}
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          className={buttonClass}
          disabled={state === "loading"}
        >
          {label}
        </button>
      </form>
    </>
  );
}
