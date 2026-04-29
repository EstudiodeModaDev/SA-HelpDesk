import React from "react";
import DashboardDetallado from "./DashboardDetallado/DashboardDetallado"
import "./Dashboard.css"
import DashboardResumen from "./DashboardGeneral/DashbordResumen";

type Mode = "resumen" | "dashboard"; // ajusta
type Item = { id: Mode; label: string; icon?: React.ReactNode; active?: boolean };

export default function DashBoardPage() {

  const [mode, setMode] = React.useState<string>("resumen");
  const Items: Item[] = [
    {
      id: "resumen", 
      label: "Dashboard", 
      active: true, 
      icon: 
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 15 15">
          <path fill="var(--ink)" fill-rule="evenodd" d="M2.8 1h-.05c-.229 0-.426 0-.6.041A1.5 1.5 0 0 0 1.04 2.15c-.04.174-.04.37-.04.6v2.5c0 .229 0 .426.041.6A1.5 1.5 0 0 0 2.15 6.96c.174.04.37.04.6.04h2.5c.229 0 .426 0 .6-.041A1.5 1.5 0 0 0 6.96 5.85c.04-.174.04-.37.04-.6v-2.5c0-.229 0-.426-.041-.6A1.5 1.5 0 0 0 5.85 1.04C5.676 1 5.48 1 5.25 1H2.8Zm-.417 1.014c.043-.01.11-.014.417-.014h2.4c.308 0 .374.003.417.014a.5.5 0 0 1 .37.37c.01.042.013.108.013.416v2.4c0 .308-.003.374-.014.417a.5.5 0 0 1-.37.37C5.575 5.996 5.509 6 5.2 6H2.8c-.308 0-.374-.003-.417-.014a.5.5 0 0 1-.37-.37C2.004 5.575 2 5.509 2 5.2V2.8c0-.308.003-.374.014-.417a.5.5 0 0 1 .37-.37ZM9.8 1h-.05c-.229 0-.426 0-.6.041A1.5 1.5 0 0 0 8.04 2.15c-.04.174-.04.37-.04.6v2.5c0 .229 0 .426.041.6A1.5 1.5 0 0 0 9.15 6.96c.174.04.37.04.6.04h2.5c.229 0 .426 0 .6-.041a1.5 1.5 0 0 0 1.11-1.109c.04-.174.04-.37.04-.6v-2.5c0-.229 0-.426-.041-.6a1.5 1.5 0 0 0-1.109-1.11c-.174-.04-.37-.04-.6-.04H9.8Zm-.417 1.014c.043-.01.11-.014.417-.014h2.4c.308 0 .374.003.417.014a.5.5 0 0 1 .37.37c.01.042.013.108.013.416v2.4c0 .308-.004.374-.014.417a.5.5 0 0 1-.37.37c-.042.01-.108.013-.416.013H9.8c-.308 0-.374-.003-.417-.014a.5.5 0 0 1-.37-.37C9.004 5.575 9 5.509 9 5.2V2.8c0-.308.003-.374.014-.417a.5.5 0 0 1 .37-.37ZM2.75 8h2.5c.229 0 .426 0 .6.041A1.5 1.5 0 0 1 6.96 9.15c.04.174.04.37.04.6v2.5c0 .229 0 .426-.041.6a1.5 1.5 0 0 1-1.109 1.11c-.174.04-.37.04-.6.04h-2.5c-.229 0-.426 0-.6-.041a1.5 1.5 0 0 1-1.11-1.109c-.04-.174-.04-.37-.04-.6v-2.5c0-.229 0-.426.041-.6A1.5 1.5 0 0 1 2.15 8.04c.174-.04.37-.04.6-.04Zm.05 1c-.308 0-.374.003-.417.014a.5.5 0 0 0-.37.37C2.004 9.425 2 9.491 2 9.8v2.4c0 .308.003.374.014.417a.5.5 0 0 0 .37.37c.042.01.108.013.416.013h2.4c.308 0 .374-.004.417-.014a.5.5 0 0 0 .37-.37c.01-.042.013-.108.013-.416V9.8c0-.308-.003-.374-.014-.417a.5.5 0 0 0-.37-.37C5.575 9.004 5.509 9 5.2 9H2.8Zm7-1h-.05c-.229 0-.426 0-.6.041A1.5 1.5 0 0 0 8.04 9.15c-.04.174-.04.37-.04.6v2.5c0 .229 0 .426.041.6a1.5 1.5 0 0 0 1.109 1.11c.174.041.371.041.6.041h2.5c.229 0 .426 0 .6-.041a1.5 1.5 0 0 0 1.109-1.109c.041-.174.041-.371.041-.6V9.75c0-.229 0-.426-.041-.6a1.5 1.5 0 0 0-1.109-1.11c-.174-.04-.37-.04-.6-.04H9.8Zm-.417 1.014c.043-.01.11-.014.417-.014h2.4c.308 0 .374.003.417.014a.5.5 0 0 1 .37.37c.01.042.013.108.013.416v2.4c0 .308-.004.374-.014.417a.5.5 0 0 1-.37.37c-.042.01-.108.013-.416.013H9.8c-.308 0-.374-.004-.417-.014a.5.5 0 0 1-.37-.37C9.004 12.575 9 12.509 9 12.2V9.8c0-.308.003-.374.014-.417a.5.5 0 0 1 .37-.37Z" clip-rule="evenodd"/>
        </svg>
    }, 
    {
      id: "dashboard", 
      label: "Detallado", 
      active: true, 
      icon: 
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
          <g fill="none">
            <path fill="#000000" fill-opacity=".16" d="M22 6.6v1.8a1.6 1.6 0 0 1-1.6 1.6H7.6A1.6 1.6 0 0 1 6 8.4V6.6A1.6 1.6 0 0 1 7.6 5h12.8A1.6 1.6 0 0 1 22 6.6m-8 9v1.8a1.6 1.6 0 0 1-1.6 1.6H7.6A1.6 1.6 0 0 1 6 17.4v-1.8A1.6 1.6 0 0 1 7.6 14h4.8a1.6 1.6 0 0 1 1.6 1.6"/>
            <path stroke="var(--ink)" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="1.5" d="M2 2v20m12-6.4v1.8a1.6 1.6 0 0 1-1.6 1.6H7.6A1.6 1.6 0 0 1 6 17.4v-1.8A1.6 1.6 0 0 1 7.6 14h4.8a1.6 1.6 0 0 1 1.6 1.6m8-9v1.8a1.6 1.6 0 0 1-1.6 1.6H7.6A1.6 1.6 0 0 1 6 8.4V6.6A1.6 1.6 0 0 1 7.6 5h12.8A1.6 1.6 0 0 1 22 6.6"/>
          </g>
        </svg>}]

  return (
    <section className="msb-layout">
        <div className="msb">
          <div className="msb-track">
          {Items.map((it) => {
            const isActive = mode === it.id;
            return (
              <button key={it.id} type="button" className={`msb-item ${isActive ? "is-active" : ""}`} onClick={() => {setMode(it.id)}} aria-current={isActive ? "page" : undefined}
                aria-pressed={isActive} title={it.label}>
                <div className="msb-item__inner">
                  <div className="msb-icon" aria-hidden="true">{it.icon}</div>
                  <div className="msb-label">{it.label}</div>
                </div>
              </button>
            );
          })}
          <div className="msb-spacer" aria-hidden="true" />
          </div>
        </div>

        {mode === "resumen" ? <DashboardResumen /> : <DashboardDetallado />}
    </section>
  );
}
