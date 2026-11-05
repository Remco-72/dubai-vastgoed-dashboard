"use client";
import { useEffect, useState } from "react";
import { Download, WifiOff, CheckCircle2, Share, X } from "lucide-react";
import { basePath } from "../lib/paths";

export function OfflineApp() {
  const [state, setState] = useState<
    "preparing" | "ready" | "unavailable" | "development"
  >("preparing");
  const [online, setOnline] = useState(true);
  const [standalone, setStandalone] = useState(false);
  const [instructions, setInstructions] = useState(false);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const mode = window.matchMedia("(display-mode: standalone)");
    const updateMode = () =>
      setStandalone(
        mode.matches ||
          !!(navigator as Navigator & { standalone?: boolean }).standalone,
      );
    updateMode();
    mode.addEventListener("change", updateMode);
    let alive = true;
    if (process.env.NODE_ENV !== "production") setState("development");
    else if (!("serviceWorker" in navigator) || !window.isSecureContext)
      setState("unavailable");
    else
      navigator.serviceWorker
        .register(`${basePath}/sw.js`, {
          scope: `${basePath}/`,
          updateViaCache: "none",
        })
        .then(async (registration) => {
          if (!registration.active) {
            const worker = registration.installing || registration.waiting;
            if (worker)
              await new Promise<void>((resolve, reject) => {
                const check = () => {
                  if (worker.state === "activated") {
                    worker.removeEventListener("statechange", check);
                    resolve();
                  } else if (worker.state === "redundant") {
                    worker.removeEventListener("statechange", check);
                    reject(new Error("Offline download failed"));
                  }
                };
                worker.addEventListener("statechange", check);
                check();
              });
          }
          await navigator.serviceWorker.ready;
          if (alive) setState("ready");
          // A pending update activates after all old windows close; never interrupt edits.
          registration.update().catch(() => {});
        })
        .catch(() => {
          if (alive) setState("unavailable");
        });
    return () => {
      alive = false;
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      mode.removeEventListener("change", updateMode);
    };
  }, []);
  const text =
    state === "ready"
      ? online
        ? "Offline beschikbaar"
        : "Offline · je kunt gewoon verder werken"
      : state === "preparing"
        ? "Offlinegebruik voorbereiden…"
        : state === "development"
          ? "Voorbeeldmodus · offlinegebruik in de gepubliceerde app"
          : "Offlinegebruik nog niet beschikbaar · open de website online opnieuw";
  return (
    <section className="pwa-card" aria-label="Installatie en offlinegebruik">
      <div className="pwa-status" role="status">
        {!online ? (
          <WifiOff size={16} />
        ) : state === "ready" ? (
          <CheckCircle2 size={16} />
        ) : (
          <Download size={16} />
        )}
        <span>{text}</span>
      </div>
      {!standalone && (
        <button
          className="text-button"
          onClick={() => setInstructions((v) => !v)}
          aria-expanded={instructions}
        >
          {instructions ? <X size={15} /> : <Share size={15} />}{" "}
          {instructions ? "Sluiten" : "Op je iPad installeren"}
        </button>
      )}
      {instructions && (
        <div className="pwa-instructions">
          <strong>Voeg Apex toe aan je beginscherm</strong>
          <ol>
            <li>Open dit webadres in Safari op je iPad.</li>
            <li>Tik op Delen (het vierkant met het pijltje omhoog).</li>
            <li>
              Kies ‘Zet op beginscherm’. Zet ‘Open als webapp’ aan als je die
              optie ziet en tik op ‘Voeg toe’.
            </li>
            <li>
              Open het nieuwe Apex-icoon. Wacht op ‘Offline beschikbaar’ voordat
              je de internetverbinding verbreekt.
            </li>
          </ol>
          <p>
            Bewaar regelmatig een back-up via Exporteer gegevens. Bij een
            overstap naar de app of een ander webadres kun je die back-up
            opnieuw importeren; gegevens worden niet automatisch overgezet.
          </p>
        </div>
      )}
    </section>
  );
}
