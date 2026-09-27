"use client";

import { useState } from "react";

/**
 * Nombre d'ouvertures d'une fenêtre, à donner en `key` à un élément dont
 * l'entrée doit se rejouer à chaque ouverture : la fenêtre reste montée entre
 * deux ouvertures, et l'élément garde son état final pendant la sortie.
 */
export function useOuvertures(ouvert: boolean): number {
  const [etat, setEtat] = useState({ ouvert, nombre: ouvert ? 1 : 0 });
  if (etat.ouvert !== ouvert) setEtat({ ouvert, nombre: ouvert ? etat.nombre + 1 : etat.nombre });
  return etat.nombre;
}
