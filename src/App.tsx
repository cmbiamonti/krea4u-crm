// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import { Toaster } from 'react-hot-toast'
import ScrollToTop from '@/components/ScrollToTop'

// ✅ Cookie Consent
import { CookieConsentProvider } from './contexts/CookieConsentContext'
import { CookieBanner } from './components/cookies/CookieBanner'

// ✅ Landing Page pubblica
import HeroPage from '@/pages/public/HeroPage'

// Auth Pages
import Login          from '@/pages/Login'
import Register       from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import MembershipFormPage from '@/pages/auth/MembershipFormPage'

// Protected Pages
import Dashboard from '@/pages/Dashboard'

// Artists
import Artists       from '@/pages/Artists'
import ArtistDetail  from '@/pages/ArtistDetail'
import ArtistForm    from '@/pages/ArtistForm'
import ArtistsImport from '@/pages/ArtistsImport'

// Venues
import Venues          from '@/pages/Venues'
import VenueDetail     from '@/pages/VenueDetail'
import VenueForm       from '@/pages/VenueForm'
import VenuesComparison from '@/pages/VenuesComparison'

// Projects
import Projects       from '@/pages/Projects'
import ProjectDetail  from '@/pages/ProjectDetail'
import ProjectWizard  from '@/pages/ProjectWizard'
import ProjectEditForm from '@/pages/ProjectEditForm'

// Messaggistica Esterna
import Messages      from '@/pages/Messages'
import EmailSettings from '@/pages/EmailSettings'

// Support & Budget
import Support           from '@/pages/Support'
import BudgetPage        from '@/pages/BudgetPage'
import CollaboratorsPage from '@/pages/CollaboratorsPage'

// Settings
import Settings              from '@/pages/Settings'
import NotificationSettings  from '@/pages/NotificationSettings'

// Templates
import TemplateManager from '@/components/templates/TemplateManager'

// ✅ About Pages (pubbliche)
import Krea4ucrmPage from '@/pages/about/Krea4uCrmPage'
import SupportPage   from '@/pages/about/SupportPage'
import ContactsPage  from '@/pages/about/ContactsPage'
import FaqPage       from '@/pages/public/FaqPage'

function App() {
  return (
    // ✅ BrowserRouter è il wrapper più esterno
    <BrowserRouter>

      {/* ✅ CookieConsentProvider wrappa tutto il contenuto
          — deve stare DENTRO BrowserRouter (per usare
            eventuali link interni nel banner)
          — deve stare FUORI da AuthProvider (il consenso
            cookie è indipendente dall'autenticazione)    */}
      <CookieConsentProvider>

        {/* ✅ Il banner si mostra automaticamente al primo
            accesso e si gestisce tramite il Context      */}
        <CookieBanner />

        <AuthProvider>
          <ScrollToTop />
          <Toaster position="top-right" />

          <Routes>

            {/* ===============================================
                PUBLIC ROUTES — Accessibili senza login
            =============================================== */}

            {/* Landing Page — Root del sito Krea4u_CRM */}
            <Route path="/"               element={<HeroPage />} />

            {/* Auth */}
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register/membership" element={<MembershipFormPage />} />

            {/* About — pagine pubbliche */}
            <Route path="/about/crm"      element={<Krea4ucrmPage />} />
            <Route path="/about/support"  element={<SupportPage />} />
            <Route path="/about/contacts" element={<ContactsPage />} />
            <Route path="/faq"            element={<FaqPage />} />

            {/* ===============================================
                PROTECTED ROUTES — Richiedono autenticazione
                Tutte sotto /app/*
            =============================================== */}
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard — /app/ */}
              <Route index element={<Dashboard />} />

              {/* -------------------------------------------
                  ARTISTS — /app/artists/*
              ------------------------------------------- */}
              <Route path="artists">
                <Route index         element={<Artists />} />
                <Route path="new"    element={<ArtistForm />} />
                <Route path="import" element={<ArtistsImport />} />
                <Route path=":id"      element={<ArtistDetail />} />
                <Route path=":id/edit" element={<ArtistForm />} />
              </Route>

              {/* -------------------------------------------
                  VENUES — /app/venues/*
              ------------------------------------------- */}
              <Route path="venues">
                <Route index          element={<Venues />} />
                <Route path="new"     element={<VenueForm />} />
                <Route path="compare" element={<VenuesComparison />} />
                <Route path=":id"      element={<VenueDetail />} />
                <Route path=":id/edit" element={<VenueForm />} />
              </Route>

              {/* -------------------------------------------
                  PROJECTS — /app/projects/*
              ------------------------------------------- */}
              <Route path="projects">
                <Route index       element={<Projects />} />
                <Route path="new"  element={<ProjectWizard />} />
                <Route path=":id"      element={<ProjectDetail />} />
                <Route path=":id/edit" element={<ProjectEditForm />} />
              </Route>

              {/* -------------------------------------------
                  MESSAGES
              ------------------------------------------- */}
              <Route path="messages"       element={<Messages />} />
              <Route path="email-settings" element={<EmailSettings />} />

              {/* -------------------------------------------
                  BUDGET & COLLABORATORS
              ------------------------------------------- */}
              <Route path="budget"        element={<BudgetPage />} />
              <Route path="collaborators" element={<CollaboratorsPage />} />

              {/* -------------------------------------------
                  SUPPORT
              ------------------------------------------- */}
              <Route path="support" element={<Support />} />

              {/* -------------------------------------------
                  SETTINGS — /app/settings/*
              ------------------------------------------- */}
              <Route path="settings">
                <Route index                element={<Settings />} />
                <Route path="notifications" element={<NotificationSettings />} />
                <Route path="templates"     element={<TemplateManager />} />
              </Route>

              {/* Catch-all interno → Dashboard */}
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>

            {/* ===============================================
                CATCH-ALL GLOBALE → HeroPage
            =============================================== */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </AuthProvider>

      </CookieConsentProvider>
    </BrowserRouter>
  )
}

export default App