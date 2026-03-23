// src/pages/CollaboratorsPage.tsx

import PageHeader from '@/components/PageHeader'
import CollaboratorsManager from '@/components/collaborators/CollaboratorsManager'

export default function CollaboratorsPage() {
  return (
    <div>
      <PageHeader
        title="Collaboratori"
        description="Gestisci i collaboratori dei tuoi progetti"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Collaboratori' },
        ]}
      />

      <CollaboratorsManager />
    </div>
  )
}