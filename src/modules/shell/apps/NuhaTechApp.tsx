"use client";
import { InternetExplorerApp } from "./InternetExplorerApp";

/** Launching this app via desktop / Start menu opens IE6 directly on the
 *  NuhaTech profile page. The fallback handling for the github.com host
 *  lives inside InternetExplorerApp itself, so navigating there from any
 *  other IE window also lands on the same custom page. */
export function NuhaTechApp() {
  return <InternetExplorerApp startUrl="https://github.com/nuhatech" />;
}
