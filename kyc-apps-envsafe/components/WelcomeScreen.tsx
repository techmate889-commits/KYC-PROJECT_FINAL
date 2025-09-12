/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from "react";
import { LogoIcon } from "./icons";

export const WelcomeScreen: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-12 flex-grow">
      <div className="w-full max-w-3xl">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <LogoIcon className="w-16 h-16 text-blue-500" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Client Intelligence, Instantly.
        </h1>

        {/* Subhead */}
        <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Enter an Instagram handle above and run <span className="font-semibold text-slate-900 dark:text-slate-100">QuickCheck ⚡</span> to generate a
          professional KYC profile with verified stats, business context, and a downloadable PDF report.
        </p>

        {/* Helper Card */}
        <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm text-left">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              How it works
            </h2>
          </div>
          <div className="px-5 py-5 grid gap-4 sm:grid-cols-2">
            <Step
              title="1) Search"
              detail="Type the Instagram username (without @) in the search bar."
            />
            <Step
              title="2) QuickCheck ⚡"
              detail="Click the button below the input to analyze and compile a report."
            />
            <Step
              title="3) Review"
              detail="Inspect Personal, Business, Instagram, and Recognition sections."
            />
            <Step
              title="4) Export PDF"
              detail="Download a neatly formatted report for clients or internal use."
            />
          </div>
        </div>

        {/* Tips / Notes */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Note
            label="Data Coverage"
            text="If some fields are not publicly available, we’ll show a clean placeholder so your report stays professional."
          />
          <Note
            label="Light/Dark"
            text="Theme defaults to light. Use the toggle in the header to switch modes anytime."
          />
        </div>
      </div>
    </section>
  );
};

/* Subcomponents */

function Step({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/60">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </p>
      <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{detail}</p>
    </div>
  );
}

function Note({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </p>
      <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{text}</p>
    </div>
  );
}
