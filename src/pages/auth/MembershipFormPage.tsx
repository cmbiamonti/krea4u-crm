// src/pages/auth/MembershipFormPage.tsx
// ✅ Form di richiesta accesso — NESSUNA creazione account automatica
// ✅ Email via PHP proxy su Hostinger — nessun Supabase, nessun database
// ✅ Solo email all'amministratore — nessuna conferma all'utente

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Checkbox,
  Grid,
  MenuItem,
  Select,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Business,
  Person,
  ContactMail,
  Description,
  CheckCircle,
  Send,
  AccessTime,
  HowToReg,
} from '@mui/icons-material';

// ── Tipi ──────────────────────────────────────────────────────────────────────
interface MembershipFormData {
  personType:         'fisica' | 'giuridica' | ''
  // Persona fisica
  firstName:          string
  lastName:           string
  birthDate:          string
  birthPlace:         string   // opzionale
  birthProvince:      string   // opzionale
  citizenship:        string   // opzionale
  // Persona giuridica
  companyName:        string
  legalForm:          string
  legalFormOther:     string
  legalAddress:       string
  legalAddressNumber: string
  legalCAP:           string
  legalCity:          string
  legalProvince:      string
  legalRepName:       string
  legalRepSurname:    string
  // Residenza e contatti
  address:            string
  addressNumber:      string
  cap:                string
  city:               string
  province:           string
  country:            string   // opzionale
  phone:              string   // opzionale
  email:              string
  // Motivazione
  motivation:         string
  // Dichiarazioni
  is18Plus:              boolean
  acceptTerms:           boolean
  acceptPrivacy:         boolean
  awareOfApproval:       boolean
  dataProcessingConsent: boolean
}

// ── Costanti ──────────────────────────────────────────────────────────────────
const ADMIN_EMAIL   = 'info@lastanzadellarte.com'
const MAILER_URL    = import.meta.env.VITE_MAILER_URL    as string
const MAILER_TOKEN  = import.meta.env.VITE_MAILER_TOKEN  as string

// ── Invio email via PHP proxy Hostinger ───────────────────────────────────────
// ✅ Nessun Supabase — fetch diretto al PHP script su Hostinger
// ✅ Solo email admin — nessuna conferma all'utente
const sendRegistrationEmail = async (
  formData: MembershipFormData,
  applicantName: string
): Promise<void> => {

  if (!MAILER_URL || !MAILER_TOKEN) {
    throw new Error(
      'Configurazione mailer mancante. ' +
      'Verifica VITE_MAILER_URL e VITE_MAILER_TOKEN nel file .env'
    )
  }

  let res: Response
  try {
    res = await fetch(MAILER_URL, {
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'X-Mailer-Token': MAILER_TOKEN,
      },
      body: JSON.stringify({
        to:       ADMIN_EMAIL,
        subject:  `📋 Nuova Richiesta Accesso Krea4u CRM - ${applicantName}`,
        html:     buildAdminEmail(formData, applicantName),
        reply_to: formData.email,   // ← admin risponde direttamente al richiedente
      }),
    })
  } catch (networkError: any) {
    throw new Error(
      `Impossibile contattare il server email. ` +
      `Verifica la connessione. (${networkError.message})`
    )
  }

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`
    try {
      const errJson = await res.json()
      errMsg = errJson.error ?? errJson.details ?? errMsg
    } catch {
      errMsg = (await res.text()) || errMsg
    }
    throw new Error(`Errore invio email: ${errMsg}`)
  }
}

// ── Template email amministratore ─────────────────────────────────────────────
const buildAdminEmail = (
  f: MembershipFormData,
  applicantName: string
): string => {
  const dateStr = new Date().toLocaleDateString('it-IT', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body        { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .header     { background: linear-gradient(135deg, #1F4788, #C55A11); color: white; padding: 24px; text-align: center; }
    .content    { padding: 24px; }
    .section    { margin-bottom: 24px; background: #f9f9f9; padding: 16px; border-radius: 8px; border-left: 4px solid #1F4788; }
    .sec-title  { color: #1F4788; font-weight: bold; font-size: 16px; margin-bottom: 12px; }
    .field      { margin: 6px 0; font-size: 14px; }
    .lbl        { font-weight: bold; color: #555; min-width: 180px; display: inline-block; }
    .action-box { background: #FFF3E0; border: 2px solid #FF9800; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .footer     { background: #f0f0f0; padding: 16px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>

  <div class="header">
    <h1 style="margin:0 0 8px 0">📋 Nuova Richiesta Accesso Krea4u CRM</h1>
    <p style="margin:0;opacity:.9">Ricevuta il ${dateStr}</p>
  </div>

  <div class="content">

    <div class="action-box">
      <h3 style="color:#E65100;margin-top:0">
        ⚡ Azione Richiesta — Entro 5 Giorni Lavorativi
      </h3>
      <ol style="margin:0;padding-left:20px">
        <li>Valuta la richiesta di accesso</li>
        <li>Se approvata: crea l'account su Supabase Dashboard</li>
        <li>Rispondi a questa email con le credenziali di accesso</li>
        <li>Se non approvata: rispondi motivando il diniego</li>
      </ol>
      <p style="margin:12px 0 0 0">
        <strong>Rispondi direttamente a:</strong>
        <a href="mailto:${f.email}">${f.email}</a>
      </p>
    </div>

    <!-- RIEPILOGO -->
    <div class="section">
      <div class="sec-title">📌 RIEPILOGO RICHIESTA</div>
      <div class="field">
        <span class="lbl">Richiedente:</span>
        <strong>${applicantName}</strong>
      </div>
      <div class="field">
        <span class="lbl">Tipo:</span>
        ${f.personType === 'fisica' ? 'Persona Fisica' : 'Persona Giuridica'}
      </div>
      <div class="field">
        <span class="lbl">Email risposta:</span>
        <a href="mailto:${f.email}">${f.email}</a>
      </div>
      ${f.phone
        ? `<div class="field"><span class="lbl">Telefono:</span> ${f.phone}</div>`
        : ''}
    </div>

    <!-- DATI ANAGRAFICI -->
    ${f.personType === 'fisica' ? `
    <div class="section">
      <div class="sec-title">👤 DATI ANAGRAFICI</div>
      <div class="field">
        <span class="lbl">Nome e Cognome:</span> ${f.firstName} ${f.lastName}
      </div>
      <div class="field">
        <span class="lbl">Data di nascita:</span> ${f.birthDate}
      </div>
      ${f.birthPlace
        ? `<div class="field">
             <span class="lbl">Luogo di nascita:</span>
             ${f.birthPlace}${f.birthProvince ? ` (${f.birthProvince})` : ''}
           </div>`
        : ''}
      ${f.citizenship
        ? `<div class="field">
             <span class="lbl">Cittadinanza:</span> ${f.citizenship}
           </div>`
        : ''}
    </div>
    ` : `
    <div class="section">
      <div class="sec-title">🏢 DATI PERSONA GIURIDICA</div>
      <div class="field">
        <span class="lbl">Denominazione:</span> ${f.companyName}
      </div>
      <div class="field">
        <span class="lbl">Forma giuridica:</span>
        ${f.legalForm === 'Altro' ? f.legalFormOther : f.legalForm}
      </div>
      <div class="field">
        <span class="lbl">Sede legale:</span>
        ${f.legalAddress} n.${f.legalAddressNumber},
        ${f.legalCAP} ${f.legalCity} (${f.legalProvince})
      </div>
      <div class="field">
        <span class="lbl">Rappresentante:</span>
        ${f.legalRepName} ${f.legalRepSurname}
      </div>
    </div>
    `}

    <!-- RESIDENZA E CONTATTI -->
    <div class="section">
      <div class="sec-title">📍 RESIDENZA E CONTATTI</div>
      <div class="field">
        <span class="lbl">Indirizzo:</span>
        ${f.address}${f.addressNumber ? ` n.${f.addressNumber}` : ''},
        ${f.cap ? `${f.cap} ` : ''}${f.city}${f.province ? ` (${f.province})` : ''}${f.country ? ` — ${f.country}` : ''}
      </div>
      ${f.phone
        ? `<div class="field"><span class="lbl">Telefono:</span> ${f.phone}</div>`
        : ''}
      <div class="field">
        <span class="lbl">Email:</span>
        <a href="mailto:${f.email}">${f.email}</a>
      </div>
    </div>

    <!-- MOTIVAZIONE -->
    ${f.motivation ? `
    <div class="section">
      <div class="sec-title">💭 MOTIVAZIONE</div>
      <p style="margin:0;white-space:pre-wrap">${f.motivation}</p>
    </div>
    ` : ''}

    <!-- DICHIARAZIONI -->
    <div class="section">
      <div class="sec-title">✅ DICHIARAZIONI ACCETTATE</div>
      <div class="field">✓ Maggiorenne (18+)</div>
      <div class="field">✓ Accettazione Termini di Servizio</div>
      <div class="field">✓ Accettazione Privacy Policy (GDPR)</div>
      <div class="field">✓ Consapevolezza iter di approvazione</div>
      <div class="field">✓ Consenso trattamento dati personali</div>
    </div>

  </div>

  <div class="footer">
    <p><strong>Krea4u CRM — La Stanza dell'Arte</strong></p>
    <p>Email generata automaticamente dal form di richiesta accesso.</p>
    <p>Mittente: noreply@lastanzadellarte.com</p>
  </div>

</body>
</html>`
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════
const MembershipFormPage = () => {
  const navigate = useNavigate()

  const [activeStep,    setActiveStep]    = useState(0)
  const [isSubmitting,  setIsSubmitting]  = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError,   setSubmitError]   = useState('')

  const [formData, setFormData] = useState<MembershipFormData>({
    personType:         'fisica',
    firstName:          '',
    lastName:           '',
    birthDate:          '',
    birthPlace:         '',
    birthProvince:      '',
    citizenship:        '',
    companyName:        '',
    legalForm:          '',
    legalFormOther:     '',
    legalAddress:       '',
    legalAddressNumber: '',
    legalCAP:           '',
    legalCity:          '',
    legalProvince:      '',
    legalRepName:       '',
    legalRepSurname:    '',
    address:            '',
    addressNumber:      '',
    cap:                '',
    city:               '',
    province:           '',
    country:            '',
    phone:              '',
    email:              '',
    motivation:         '',
    is18Plus:              false,
    acceptTerms:           false,
    acceptPrivacy:         false,
    awareOfApproval:       false,
    dataProcessingConsent: false,
  })

  const steps = [
    'Tipo Richiedente',
    'Dati Anagrafici',
    'Residenza e Contatti',
    'Motivazione',
    'Dichiarazioni',
  ]

  const update = (field: keyof MembershipFormData, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const handleNext = () => {
    setActiveStep(p => p + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setActiveStep(p => p - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const applicantName =
        formData.personType === 'fisica'
          ? `${formData.firstName} ${formData.lastName}`
          : formData.companyName

      // ✅ Solo email admin — nessun DB, nessun Supabase, nessuna conferma utente
      await sendRegistrationEmail(formData, applicantName)

      setSubmitSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error: any) {
      console.error('❌ Submit error:', error)
      setSubmitError(
        error.message ||
        `Errore durante l'invio. Riprova o contattaci a ${ADMIN_EMAIL}`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Validazione step ────────────────────────────────────────────────────────
  const isStepValid = (): boolean => {
    switch (activeStep) {
      case 0:
        return formData.personType !== ''
      case 1:
        return formData.personType === 'fisica'
          ? !!(formData.firstName && formData.lastName && formData.birthDate)
          : !!(formData.companyName && formData.legalForm &&
               formData.legalRepName && formData.legalRepSurname)
      case 2:
        return !!(formData.address && formData.city && formData.email)
      case 3:
        return true
      case 4:
        return (
          formData.is18Plus &&
          formData.acceptTerms &&
          formData.acceptPrivacy &&
          formData.awareOfApproval &&
          formData.dataProcessingConsent
        )
      default:
        return false
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitSuccess) {
    const applicantName =
      formData.personType === 'fisica'
        ? `${formData.firstName} ${formData.lastName}`
        : formData.companyName

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5', py: 8 }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: 'center' }}>

            <Box sx={{
              width: 80, height: 80, borderRadius: '50%',
              bgcolor: 'success.light',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', mb: 3,
            }}>
              <CheckCircle sx={{ fontSize: 50, color: 'success.dark' }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
              Richiesta Inviata!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {applicantName}
            </Typography>

            <Alert severity="success" sx={{ mb: 2, textAlign: 'left' }}>
              <AlertTitle>✅ Modulo ricevuto</AlertTitle>
              La tua richiesta è stata inviata al team di{' '}
              <strong>Krea4u - La Stanza dell'Arte</strong>.
            </Alert>

            <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
              <AlertTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" />
                  Cosa succede adesso
                </Box>
              </AlertTitle>
              <ol style={{ paddingLeft: 20, margin: '8px 0 0 0' }}>
                <li>
                  Il team valuta la richiesta{' '}
                  <Chip
                    label="5 gg lavorativi"
                    size="small"
                    color="warning"
                    sx={{ ml: 1 }}
                  />
                </li>
                <li>
                  Se approvata: ricevi email con le{' '}
                  <strong>credenziali di accesso</strong> a{' '}
                  <strong>{formData.email}</strong>
                </li>
                <li>Se non approvata: ricevi email con la motivazione</li>
                <li>Accedi con le credenziali su <strong>/login</strong></li>
              </ol>
            </Alert>

            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              <AlertTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HowToReg fontSize="small" />
                  Non creare account autonomamente
                </Box>
              </AlertTitle>
              <Typography variant="body2">
                Le credenziali saranno create dall'amministratore e inviate
                via email a <strong>{formData.email}</strong> dopo l'approvazione.
              </Typography>
            </Alert>

            <Button
              variant="contained" size="large" fullWidth
              onClick={() => navigate('/login')}
              sx={{ mb: 2 }}
            >
              Vai al Login
            </Button>
            <Button
              variant="outlined" size="large" fullWidth
              onClick={() => navigate('/')}
            >
              Torna alla Home
            </Button>

          </Paper>
        </Container>
      </Box>
    )
  }

  // ── Step content ────────────────────────────────────────────────────────────
  const renderStepContent = () => {
    switch (activeStep) {

      // ── Step 0: Tipo richiedente ──────────────────────────────────────────
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person /> Tipo di Richiedente
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>ℹ️ Come funziona</AlertTitle>
              <Typography variant="body2">
                Questa richiesta verrà valutata dal team entro{' '}
                <strong>5 giorni lavorativi</strong>. In caso di approvazione
                riceverai via email le credenziali di accesso al CRM.
                La richiesta potrebbe non essere accettata.
              </Typography>
            </Alert>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={formData.personType}
                onChange={e => update('personType', e.target.value)}
              >
                <Paper variant="outlined" sx={{ p: 2, mb: 2, cursor: 'pointer' }}>
                  <FormControlLabel
                    value="fisica"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          👤 Persona Fisica
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Richiesta come singolo individuo
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, cursor: 'pointer' }}>
                  <FormControlLabel
                    value="giuridica"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          🏢 Persona Giuridica
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Richiesta come associazione, società o fondazione
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
          </Box>
        )

      // ── Step 1: Dati anagrafici ───────────────────────────────────────────
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {formData.personType === 'fisica' ? <Person /> : <Business />}
              Dati Anagrafici
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {formData.personType === 'fisica' ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth required label="Nome"
                    value={formData.firstName}
                    onChange={e => update('firstName', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth required label="Cognome"
                    value={formData.lastName}
                    onChange={e => update('lastName', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth required type="date" label="Data di Nascita"
                    value={formData.birthDate}
                    onChange={e => update('birthDate', e.target.value)}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth label="Luogo di Nascita (opzionale)"
                    value={formData.birthPlace}
                    onChange={e => update('birthPlace', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField fullWidth label="Prov. (opz.)"
                    value={formData.birthProvince}
                    onChange={e => update('birthProvince', e.target.value.toUpperCase())}
                    inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Cittadinanza (opzionale)"
                    value={formData.citizenship}
                    onChange={e => update('citizenship', e.target.value)}
                    placeholder="es. Italiana" />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth required label="Denominazione / Ragione Sociale"
                    value={formData.companyName}
                    onChange={e => update('companyName', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth required>
                    <FormLabel>Forma Giuridica</FormLabel>
                    <Select value={formData.legalForm}
                      onChange={e => update('legalForm', e.target.value)}>
                      <MenuItem value="Associazione">Associazione</MenuItem>
                      <MenuItem value="Società">Società</MenuItem>
                      <MenuItem value="Fondazione">Fondazione</MenuItem>
                      <MenuItem value="Altro">Altro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {formData.legalForm === 'Altro' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth required label="Specifica Forma Giuridica"
                      value={formData.legalFormOther}
                      onChange={e => update('legalFormOther', e.target.value)} />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField fullWidth required label="Sede Legale (Via/Piazza)"
                    value={formData.legalAddress}
                    onChange={e => update('legalAddress', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField fullWidth required label="Numero"
                    value={formData.legalAddressNumber}
                    onChange={e => update('legalAddressNumber', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField fullWidth required label="CAP"
                    value={formData.legalCAP}
                    onChange={e => update('legalCAP', e.target.value)}
                    inputProps={{ maxLength: 5 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <TextField fullWidth required label="Città"
                    value={formData.legalCity}
                    onChange={e => update('legalCity', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField fullWidth required label="Prov."
                    value={formData.legalProvince}
                    onChange={e => update('legalProvince', e.target.value.toUpperCase())}
                    inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
                    Rappresentante Legale
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth required label="Nome Rappresentante"
                    value={formData.legalRepName}
                    onChange={e => update('legalRepName', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth required label="Cognome Rappresentante"
                    value={formData.legalRepSurname}
                    onChange={e => update('legalRepSurname', e.target.value)} />
                </Grid>
              </Grid>
            )}
          </Box>
        )

      // ── Step 2: Residenza e contatti ──────────────────────────────────────
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ContactMail /> Residenza e Contatti
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField fullWidth required label="Indirizzo (Via/Piazza)"
                  value={formData.address}
                  onChange={e => update('address', e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Numero (opzionale)"
                  value={formData.addressNumber}
                  onChange={e => update('addressNumber', e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField fullWidth label="CAP (opzionale)"
                  value={formData.cap}
                  onChange={e => update('cap', e.target.value)}
                  inputProps={{ maxLength: 5 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 7 }}>
                <TextField fullWidth required label="Città"
                  value={formData.city}
                  onChange={e => update('city', e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField fullWidth label="Prov. (opz.)"
                  value={formData.province}
                  onChange={e => update('province', e.target.value.toUpperCase())}
                  inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Stato (opzionale)"
                  value={formData.country}
                  onChange={e => update('country', e.target.value)}
                  placeholder="es. Italia" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Telefono (opzionale)"
                  value={formData.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="+39 3xx xxxxxxx" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth required type="email" label="Email"
                  value={formData.email}
                  onChange={e => update('email', e.target.value)}
                  helperText="Il team utilizzerà questo indirizzo per risponderti"
                />
              </Grid>
            </Grid>
          </Box>
        )

      // ── Step 3: Motivazione ───────────────────────────────────────────────
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description /> Motivazione
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Sezione <strong>facoltativa</strong> ma consigliata.
                Una motivazione chiara aiuta il team a valutare la tua richiesta.
              </Typography>
            </Alert>

            <TextField
              fullWidth multiline rows={6}
              label="Perché vuoi accedere a Krea4u CRM?"
              value={formData.motivation}
              onChange={e => update('motivation', e.target.value)}
              placeholder="Descrivi la tua attività, come intendi usare il CRM, quali funzionalità ti interessano..."
            />
          </Box>
        )

      // ── Step 4: Dichiarazioni ─────────────────────────────────────────────
      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle /> Dichiarazioni
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#fafafa' }}>
              {[
                {
                  field: 'is18Plus',
                  label: 'Dichiaro di essere maggiorenne (18+)',
                },
                {
                  field: 'acceptTerms',
                  label: 'Ho letto e accetto i Termini di Servizio',
                },
                {
                  field: 'acceptPrivacy',
                  label: 'Ho letto e accetto la Privacy Policy (GDPR)',
                },
                {
                  field: 'awareOfApproval',
                  label: 'Sono consapevole che la richiesta è soggetta ad approvazione e potrebbe non essere accettata',
                },
              ].map(item => (
                <FormControlLabel
                  key={item.field}
                  sx={{ display: 'flex', mb: 1 }}
                  control={
                    <Checkbox
                      checked={
                        formData[item.field as keyof MembershipFormData] as boolean
                      }
                      onChange={e =>
                        update(item.field as keyof MembershipFormData, e.target.checked)
                      }
                    />
                  }
                  label={item.label}
                />
              ))}
            </Paper>

            <Paper variant="outlined"
              sx={{ p: 2, bgcolor: '#E3F2FD', border: '2px solid #1F4788', mb: 3 }}>
              <FormControlLabel
                sx={{ display: 'flex' }}
                control={
                  <Checkbox
                    checked={formData.dataProcessingConsent}
                    onChange={e => update('dataProcessingConsent', e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    <strong>Acconsento al trattamento dei miei dati personali</strong>
                    {' '}per le finalità descritte nella Privacy Policy,
                    ai sensi del Regolamento EU 2016/679 (GDPR)
                  </Typography>
                }
              />
            </Paper>

            <Alert severity="warning">
              <AlertTitle>📋 Riepilogo richiesta</AlertTitle>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Stai inviando una richiesta di accesso per{' '}
                <strong>
                  {formData.personType === 'fisica'
                    ? `${formData.firstName} ${formData.lastName}`
                    : formData.companyName}
                </strong>.
                Il team risponderà all'indirizzo{' '}
                <strong>{formData.email}</strong>.
              </Typography>
              <Typography variant="body2">
                Risposta entro <strong>5 giorni lavorativi</strong>.
                In caso di approvazione riceverai le credenziali di accesso.
              </Typography>
            </Alert>
          </Box>
        )

      default:
        return null
    }
  }

  // ── Render principale ───────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F5', py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Richiesta di Accesso Krea4u CRM
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compila il modulo — il team valuterà la tua richiesta entro 5 giorni lavorativi
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            {renderStepContent()}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || isSubmitting}
            >
              Indietro
            </Button>

            <Box sx={{ flex: 1 }} />

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
                size="large"
              >
                {isSubmitting ? 'Invio in corso...' : 'Invia Richiesta'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid()}
                size="large"
              >
                Avanti
              </Button>
            )}
          </Box>

        </Paper>
      </Container>
    </Box>
  )
}

export default MembershipFormPage