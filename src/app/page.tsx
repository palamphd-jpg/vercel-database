"use client";

import { useState, FormEvent } from "react";
import { Gem, Star } from "lucide-react";

const STAFF_OPTIONS = ["Pleasant", "Very Good", "Good", "Not Bad"];

type Status = "idle" | "submitting" | "success" | "error";

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;

  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Rating out of 5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} out of 5`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(n)}
          onBlur={() => setHovered(null)}
          onClick={() => onChange(n)}
          className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          <Star
            size={34}
            strokeWidth={1.5}
            color={n <= active ? "var(--color-gold)" : "#d6d0c4"}
            fill={n <= active ? "var(--color-gold)" : "transparent"}
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [staffExperience, setStaffExperience] = useState("");
  const [comments, setComments] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (rating === 0 || !name.trim() || !phone.trim()) {
      setErrorMsg("Please add a rating, your name, and your phone number before sending.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, name, phone, staffExperience, comments }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Couldn't reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  }

  function resetForm() {
    setRating(0);
    setName("");
    setPhone("");
    setStaffExperience("");
    setComments("");
    setStatus("idle");
  }

  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-16 sm:py-20">
      <div className="w-full max-w-lg animate-rise">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-2 flex items-center justify-center gap-3">
            <Gem size={30} strokeWidth={1.5} color="var(--color-gold)" />
            <h1 className="font-display text-4xl text-charcoal sm:text-5xl">
              Mayna Diamonds
            </h1>
            <Gem size={30} strokeWidth={1.5} color="var(--color-gold)" />
          </div>
          <div className="mx-auto mb-3 h-px w-16 bg-line" />
          <p className="text-sm tracking-[0.2em] text-charcoal-soft">
            SALEM, TAMIL NADU
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-line bg-white p-8 shadow-sm sm:p-10">
          {status === "success" ? (
            <div className="animate-rise py-6 text-center">
              <Gem size={44} strokeWidth={1.2} color="var(--color-gold)" className="mx-auto mb-5" />
              <h2 className="font-display text-2xl text-charcoal">
                Thank you, {name.split(" ")[0]}.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">
                Your feedback has been recorded. We read every note — it
                genuinely shapes how we look after our customers.
              </p>
              <button
                onClick={resetForm}
                className="mt-8 rounded-full border border-gold px-6 py-2.5 text-sm font-medium text-gold-dark transition-colors hover:bg-gold hover:text-white"
              >
                Share another response
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl text-charcoal">
                Share Your Experience
              </h2>
              <p className="mt-1.5 text-sm text-charcoal-soft">
                Your feedback helps us craft better moments for you.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-7">
                <div>
                  <label className="mb-3 block text-sm font-medium text-charcoal">
                    How was your Experience? <span className="text-red-500">*</span>
                  </label>
                  <StarRating value={rating} onChange={setRating} />
                </div>

                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-charcoal">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full rounded-lg border border-line bg-white px-4 py-3 text-charcoal placeholder:text-charcoal-soft/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-charcoal">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-lg border border-line bg-white px-4 py-3 text-charcoal placeholder:text-charcoal-soft/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-charcoal">
                    How was the experience with Mayna Diamonds Staffs Today?
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {STAFF_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setStaffExperience(staffExperience === opt ? "" : opt)
                        }
                        className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                          staffExperience === opt
                            ? "border-gold bg-gold text-white"
                            : "border-line bg-pill text-charcoal hover:border-gold"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="comments" className="mb-2 block text-sm font-medium text-charcoal">
                    Additional Comments <span className="text-charcoal-soft">(optional)</span>
                  </label>
                  <textarea
                    id="comments"
                    rows={4}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Tell us what you loved, or how we can improve..."
                    className="w-full resize-none rounded-lg border border-line bg-white px-4 py-3 text-charcoal placeholder:text-charcoal-soft/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-500">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-charcoal-soft/70">
          © 2026 Mayna Diamonds. All rights reserved.
        </p>
      </div>
    </main>
  );
}
