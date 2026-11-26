import React from 'react';

const STEPS = [
  { title: 'Connectez-vous', text: 'Commander demande un compte membre : c’est lui qui relie votre paiement à votre commande.' },
  { title: 'Choisissez votre mode', text: 'Retrait du stock (article disponible tout de suite) ou commande groupée (commande chez Gobik à la clôture).' },
  { title: 'Payez', text: 'Scannez le QR code ou faites un virement avec la communication structurée et le montant exacts.' },
  { title: 'Suivez vos dates', text: 'Dans Mon profil → Mes commandes : commandé, payé, commandé chez Gobik, arrivé au club, remis.' },
];

const DATES: [string, string][] = [
  ['Commandé le', 'votre commande est enregistrée.'],
  ['Payé le', 'le virement est reconnu (date de valeur de la banque).'],
  ['Commandé chez Gobik le', 'le club a passé la commande groupée au fournisseur.'],
  ['Arrivé au club le', 'le colis est reçu, vous pouvez venir chercher votre tenue.'],
  ['Remis le', 'la tenue vous a été remise.'],
];

/** « Comment commander et payer » — member-facing help; `showDates` adds the meaning of each date (Mes commandes). */
export default function OrderHowTo({ showDates = false }: { showDates?: boolean }): React.ReactElement {
  return (
    <section
      aria-labelledby="order-howto-title"
      className="space-y-4 rounded-lg border border-line bg-white p-6 dark:border-night-line dark:bg-ink"
    >
      <h2 id="order-howto-title" className="text-lg font-bold tracking-tight text-ink dark:text-white">
        Comment commander et payer
      </h2>
      <ol className="grid gap-3 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3 text-sm text-ink dark:text-snow">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white dark:bg-white dark:text-ink"
            >
              {i + 1}
            </span>
            <span>
              <span className="block font-bold">{step.title}</span>
              <span className="block text-xs text-ink-3 dark:text-snow-3">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-ink-2 dark:text-snow-2">
        Votre paiement est reconnu dès que le trésorier importe les extraits bancaires (en général dans la semaine). Un
        montant ou une communication erronés obligent à un traitement manuel, donc à un délai.
      </p>
      {showDates && (
        <dl className="space-y-1 border-t border-line pt-3 text-xs dark:border-night-line">
          {DATES.map(([term, text]) => (
            <div key={term} className="flex flex-wrap gap-x-2">
              <dt className="font-bold text-ink dark:text-snow">{term}</dt>
              <dd className="text-ink-3 dark:text-snow-3">{text}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="text-xs text-ink-3 dark:text-snow-3">Une question sur un paiement ? Contactez le trésorier du club.</p>
    </section>
  );
}
