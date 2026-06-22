"use client";
import { useState } from "react";

interface Props {
  formClass: string;
  inputClass: string;
  buttonClass: string;
}

export default function SubscribeForm({ formClass, inputClass, buttonClass }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
  }

  return (
    <form className={formClass} onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="you@somewhere.real"
        aria-label="Email address"
        required
        className={inputClass}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className={buttonClass}>
        {submitted ? "Logged ✓" : "Sign the register"}
      </button>
    </form>
  );
}
