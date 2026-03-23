// src/utils/budgetTemplates.ts

import type { BudgetTemplate } from '@/types/budget.types'

export const budgetTemplates: Record<string, BudgetTemplate> = {
  exhibition: {
    project_type: 'exhibition',
    categories: [
      {
        name: 'Allestimento',
        icon: '🏗️',
        common_items: [
          { subcategory: 'Materiali', description: 'Pannelli espositivi', unit: 'pz' },
          { subcategory: 'Materiali', description: 'Fornitura mobili', unit: 'pz' },
          { subcategory: 'Materiali', description: 'Illuminazione', unit: 'set' },
          { subcategory: 'Materiali', description: 'Supporti opere', unit: 'pz' },
          { subcategory: 'Installazione', description: 'Montaggio allestimento', unit: 'giorni' },
          { subcategory: 'Installazione', description: 'Smontaggio', unit: 'giorni' },
          { subcategory: 'Materiali', description: 'Sound System', unit: 'set' },
        ],
      },
      {
        name: 'Artisti',
        icon: '🎨',
        common_items: [
          { subcategory: 'Compensi', description: 'Cachet artista', unit: 'pz' },
          { subcategory: 'Trasporto opere', description: 'Corriere specializzato', unit: 'viaggio' },
          { subcategory: 'Assicurazione', description: 'Polizza opere', unit: 'mostra' },
          { subcategory: 'Spese artista', description: 'Vitto e alloggio', unit: 'giorni' },
        ],
      },
      {
        name: 'Spazi',
        icon: '🏛️',
        common_items: [
          { subcategory: 'Affitto', description: 'Noleggio spazio', unit: 'giorni' },
          { subcategory: 'Utenze', description: 'Luce, acqua, riscaldamento', unit: 'forfait' },
          { subcategory: 'Pulizie', description: 'Servizio pulizia', unit: 'giorni' },
          { subcategory: 'Sicurezza', description: 'Vigilanza', unit: 'ore' },
          { subcategory: 'Documentazione', description: 'Facility report/ Venue report', unit: 'pz' },
          { subcategory: 'Documentazione', description: 'Certificazioni & Permessi', unit: 'pz' },
        ],
      },
      {
        name: 'Comunicazione',
        icon: '📢',
        common_items: [
          { subcategory: 'Grafica', description: 'Design materiali', unit: 'progetto' },
          { subcategory: 'Stampa', description: 'Locandine & Pubbliche affissioni', unit: 'pz' },
          { subcategory: 'Stampa', description: 'Catalogo', unit: 'pz' },
          { subcategory: 'Digital', description: 'Campagna social media', unit: 'mese' },
          { subcategory: 'Ufficio stampa', description: 'Servizio PR', unit: 'forfait' },
        ],
      },
      {
        name: 'Inaugurazione',
        icon: '🍾',
        common_items: [
          { subcategory: 'Catering', description: 'Buffet inaugurazione', unit: 'persone' },
          { subcategory: 'Bevande', description: 'Vino e bevande', unit: 'forfait' },
          { subcategory: 'Personale', description: 'Camerieri', unit: 'ore' },
          { subcategory: 'Musica', description: 'DJ/musicista', unit: 'serata' },
        ],
      },
      {
        name: 'Personale',
        icon: '👥',
        common_items: [
          { subcategory: 'Staff', description: 'Custodi sala', unit: 'ore' },
          { subcategory: 'Staff', description: 'Receptionist', unit: 'ore' },
          { subcategory: 'Coordinamento', description: 'Project manager', unit: 'giorni' },
        ],
      },
      {
        name: 'Altro',
        icon: '📋',
        common_items: [
          { subcategory: 'Amministrazione', description: 'Spese amministrative', unit: 'forfait' },
          { subcategory: 'Assicurative', description: 'Spese Assicurative', unit: 'forfait' },
          { subcategory: 'Legali e diritti', description: 'Contrattualistica e SIAE', unit: 'forfait' },
          { subcategory: 'Imprevisti', description: 'Fondo contingenza', unit: 'forfait' },
        ],
      },
    ],
  },

  concert: {
    project_type: 'concert',
    categories: [
      {
        name: 'Artisti',
        icon: '🎤',
        common_items: [
          { subcategory: 'Compensi', description: 'Cachet artista principale', unit: 'serata' },
          { subcategory: 'Compensi', description: 'Band/musicisti', unit: 'persona' },
          { subcategory: 'Viaggio', description: 'Trasporto artisti', unit: 'viaggio' },
          { subcategory: 'Ospitalità', description: 'Hotel', unit: 'notti' },
          { subcategory: 'Ospitalità', description: 'Rider tecnico', unit: 'forfait' },
        ],
      },
      {
        name: 'Tecnica',
        icon: '🎚️',
        common_items: [
          { subcategory: 'Audio', description: 'Impianto audio', unit: 'set' },
          { subcategory: 'Luci', description: 'Impianto luci', unit: 'set' },
          { subcategory: 'Palco', description: 'Noleggio palco', unit: 'pz' },
          { subcategory: 'Tecnici', description: 'Fonico', unit: 'serata' },
          { subcategory: 'Tecnici', description: 'Light designer', unit: 'serata' },
          { subcategory: 'Backline', description: 'Strumenti musicali', unit: 'set' },
        ],
      },
      {
        name: 'Venue',
        icon: '🏟️',
        common_items: [
          { subcategory: 'Affitto', description: 'Noleggio sala', unit: 'serata' },
          { subcategory: 'Sicurezza', description: 'Servizio d\'ordine', unit: 'persone' },
          { subcategory: 'Utenze', description: 'Elettricità extra', unit: 'forfait' },
          { subcategory: 'Permessi', description: 'SIAE e diritti', unit: 'forfait' },
        ],
      },
      {
        name: 'Comunicazione',
        icon: '📢',
        common_items: [
          { subcategory: 'Grafica', description: 'Design locandina', unit: 'progetto' },
          { subcategory: 'Stampa', description: 'Manifesti', unit: 'pz' },
          { subcategory: 'Digital', description: 'Campagna social', unit: 'forfait' },
          { subcategory: 'Biglietteria', description: 'Piattaforma vendita online', unit: 'forfait' },
        ],
      },
      {
        name: 'Altro',
        icon: '📋',
        common_items: [
           { subcategory: 'Amministrazione', description: 'Spese amministrative', unit: 'forfait' },
          { subcategory: 'Assicurative', description: 'Spese Assicurative', unit: 'forfait' },
          { subcategory: 'Legali e diritti', description: 'Contrattualistica e SIAE', unit: 'forfait' },
          { subcategory: 'Imprevisti', description: 'Fondo contingenza', unit: 'forfait' },
        ],
      },
    ],
  },

  workshop: {
    project_type: 'workshop',
    categories: [
      {
        name: 'Docenti',
        icon: '👨‍🏫',
        common_items: [
          { subcategory: 'Compensi', description: 'Docente principale', unit: 'ore' },
          { subcategory: 'Compensi', description: 'Assistenti', unit: 'ore' },
          { subcategory: 'Viaggio', description: 'Rimborso spese', unit: 'forfait' },
        ],
      },
      {
        name: 'Materiali',
        icon: '🎨',
        common_items: [
          { subcategory: 'Consumabili', description: 'Materiali d\'arte', unit: 'kit' },
          { subcategory: 'Strumenti', description: 'Attrezzi workshop', unit: 'set' },
          { subcategory: 'Dispense', description: 'Fotocopie materiale didattico', unit: 'pz' },
        ],
      },
      {
        name: 'Spazi',
        icon: '🏠',
        common_items: [
          { subcategory: 'Affitto', description: 'Sala workshop', unit: 'giorni' },
          { subcategory: 'Catering', description: 'Coffee break', unit: 'persone' },
        ],
      },
      {
        name: 'Comunicazione',
        icon: '📢',
        common_items: [
          { subcategory: 'Digital', description: 'Promozione online', unit: 'forfait' },
          { subcategory: 'Iscrizioni', description: 'Piattaforma gestione iscrizioni', unit: 'forfait' },
        ],
      },
    ],
  },

  festival: {
    project_type: 'festival',
    categories: [
      {
        name: 'Artisti',
        icon: '🎭',
        common_items: [
          { subcategory: 'Compensi', description: 'Artisti ospiti', unit: 'persona' },
          { subcategory: 'Ospitalità', description: 'Hotel artisti', unit: 'notti' },
          { subcategory: 'Trasporto', description: 'Transfer', unit: 'viaggio' },
        ],
      },
      {
        name: 'Strutture',
        icon: '⛺',
        common_items: [
          { subcategory: 'Palchi', description: 'Palco principale', unit: 'pz' },
          { subcategory: 'Palchi', description: 'Palchi secondari', unit: 'pz' },
          { subcategory: 'Gazebo', description: 'Tendoni/gazebo', unit: 'pz' },
          { subcategory: 'Servizi', description: 'Bagni chimici', unit: 'pz' },
        ],
      },
      {
        name: 'Tecnica',
        icon: '🔊',
        common_items: [
          { subcategory: 'Audio/luci', description: 'Impianto completo', unit: 'set' },
          { subcategory: 'Generatori', description: 'Energia elettrica', unit: 'giorni' },
          { subcategory: 'Tecnici', description: 'Staff tecnico', unit: 'giorni' },
        ],
      },
      {
        name: 'Sicurezza',
        icon: '🚨',
        common_items: [
          { subcategory: 'Personale', description: 'Security', unit: 'persone/giorno' },
          { subcategory: 'Barriere', description: 'Transenne', unit: 'ml' },
          { subcategory: 'Medico', description: 'Postazione primo soccorso', unit: 'giorni' },
        ],
      },
      {
        name: 'Food & Beverage',
        icon: '🍔',
        common_items: [
          { subcategory: 'Stand', description: 'Area food truck', unit: 'pz' },
          { subcategory: 'Bar', description: 'Postazioni bevande', unit: 'pz' },
        ],
      },
      {
        name: 'Comunicazione',
        icon: '📢',
        common_items: [
          { subcategory: 'Grafica', description: 'Immagine coordinata', unit: 'progetto' },
          { subcategory: 'Stampa', description: 'Materiali promozionali', unit: 'forfait' },
          { subcategory: 'Digital', description: 'Campagna completa', unit: 'mesi' },
          { subcategory: 'Ufficio stampa', description: 'PR e media', unit: 'forfait' },
        ],
      },
      {
        name: 'Altro',
        icon: '📋',
        common_items: [
          { subcategory: 'Permessi', description: 'Licenze e autorizzazioni', unit: 'forfait' },
          { subcategory: 'Assicurazione', description: 'Polizza evento', unit: 'forfait' },
          { subcategory: 'Amministrazione', description: 'Gestione', unit: 'forfait' },
        ],
      },
    ],
  },
}

export function getTemplateForProjectType(projectType: string): BudgetTemplate {
  return budgetTemplates[projectType] || budgetTemplates.exhibition
}