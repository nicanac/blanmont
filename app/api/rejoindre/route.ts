import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createTrialRequest } from '@/app/lib/firebase/trial-requests';

const TrialRequestSchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().min(6, 'Numéro de téléphone requis'),
  preferredGroup: z.enum(['A', 'B', 'C', 'VTT']),
  bikeType: z.enum(['Route', 'VTT', 'Gravel', 'VAE']),
  experienceLevel: z.enum(['Débutant', 'Intermédiaire', 'Confirmé', 'Compétiteur']),
  firstRideDate: z.string().optional(),
  message: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = TrialRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const saved = await createTrialRequest(result.data);

    return NextResponse.json({
      success: true,
      message: 'Votre demande de sortie d\'essai a été enregistrée avec succès !',
      request: saved,
    });
  } catch (error) {
    console.error('Error saving trial request:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement de votre demande.' },
      { status: 500 }
    );
  }
}
