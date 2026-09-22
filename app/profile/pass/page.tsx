import type { Metadata } from 'next';
import MemberPassClient from './MemberPassClient';

export const metadata: Metadata = {
  title: 'Pass Sécurité & Carte de Membre Digitale | CC Saint-Martin Blanmont',
  description:
    'Carte numérique officielle d’adhérent au CC Saint-Martin Blanmont : licence FFBC, statut de cotisation, contact d’urgence ICE et QR code de pointage express au départ.',
};

export default function MemberPassPage() {
  return <MemberPassClient />;
}
