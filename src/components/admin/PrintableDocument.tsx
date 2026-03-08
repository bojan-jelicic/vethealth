import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Printer, FileDown, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { VisitDocument } from '@/services/visitDetailServices';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import logoImg from '@/assets/vethealth-logo.png';

interface Props {
  doc: VisitDocument;
  petName?: string;
  ownerName?: string;
  onPdfGenerated?: (pdfUrl: string) => void;
}

// ─── Clinic info ────────────────────────────────
const CLINIC = {
  name: 'VetHealth Veterinarska ambulanta',
  address: 'Ulica veterinara 15, 71000 Sarajevo',
  phone: '+387 33 123 456',
  website: 'www.vethealth.ba',
  email: 'info@vethealth.ba',
};

// ─── Field labels ───────────────────────────────
const fieldLabels: Record<string, string> = {
  vlasnik_ime: 'Ime i prezime vlasnika',
  vlasnik_adresa: 'Adresa',
  vlasnik_telefon: 'Telefon',
  ime_ljubimca: 'Ime ljubimca',
  vrsta: 'Vrsta životinje',
  pasmina: 'Pasmina',
  spol: 'Spol',
  starost: 'Starost',
  pasos_br: 'Broj pasoša',
  chip_br: 'Broj čipa',
  dijagnoza: 'Dijagnoza',
  anamneza: 'Anamneza',
  klinicka_slika: 'Klinička slika',
  terapija: 'Terapija / Th',
  napomena: 'Napomena',
  napomene: 'Napomene',
  razlog_eutanazije: 'Razlog za eutanaziju',
  veterinar: 'Veterinar',
  datum: 'Datum',
  potpis: 'Potpis',
  potpis_vlasnika: 'Potpis vlasnika',
  potpis_veterinara: 'Potpis veterinara',
  hematologija: 'Hematologija',
  biohemija: 'Biohemija',
  ekg: 'EKG',
  biopsija: 'Biopsija',
  eho: 'EHO',
  endoskopija: 'Endoskopija',
  rtg: 'RTG',
  mri_ct: 'MRI/CT',
  analiza_urina: 'Analiza urina',
  izvrsene_analize: 'Izvršene analize',
  opis_intervencije: 'Kratak opis intervencije',
  datum_ugriza: 'Datum ugriza/incidenta',
  opcina: 'Općina / Grad',
  adresa_incidenta: 'Adresa incidenta',
  zakljucak: 'Završni zaključak',
  vakcinacija_napomena: 'Napomena o vakcinaciji',
  narucilac_ime: 'Naručilac',
  narucilac_telefon: 'Telefon naručioca',
  vrsta_zivotinje: 'Vrsta životinje',
  materijal: 'Materijal',
  metoda: 'Metoda',
  rezultat: 'Rezultat',
  terapija_preporuka: 'Terapija / Preporuka',
};

const repeatingFieldLabels: Record<string, string> = {
  lijek: 'Naziv lijeka',
  doziranje: 'Doziranje',
  nacin_primjene: 'Način primjene',
  trajanje: 'Trajanje',
  opis: 'Opis',
  kolicina: 'Količina',
  cijena: 'Cijena (KM)',
  datum_pregleda: 'Datum pregleda',
  klinicki_nalaz: 'Klinički nalaz',
  dijagnoza: 'Dijagnoza',
  napomena: 'Napomena',
};

const analysisCheckboxKeys = [
  'hematologija', 'biohemija', 'ekg', 'biopsija', 'eho',
  'endoskopija', 'rtg', 'mri_ct', 'analiza_urina',
];
const signatureKeys = ['potpis', 'potpis_vlasnika', 'potpis_veterinara'];
const metaKeys = ['veterinar', 'datum', ...signatureKeys];
const petKeys = ['ime_ljubimca', 'vrsta', 'pasmina', 'spol', 'starost', 'pasos_br', 'chip_br'];
const caseIntroKeys = ['datum_ugriza', 'opcina', 'adresa_incidenta'];
const ordererKeys = ['narucilac_ime', 'narucilac_telefon'];
const labAnimalKeys = ['vrsta_zivotinje'];

const printStyles = `
  @page { margin: 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.6; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #166534; padding-bottom: 12px; margin-bottom: 20px; }
  .header img { height: 48px; }
  .header-right { text-align: right; font-size: 11px; color: #555; }
  .header-right .clinic-name { font-size: 14px; font-weight: 700; color: #166534; }
  .header-right .clinic-website { font-size: 10px; color: #166534; }
  .doc-title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; color: #166534; }
  .group-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #166534; font-weight: 700; margin-bottom: 8px; padding-bottom: 3px; border-bottom: 1px solid #e0e0e0; }
  .section { margin-bottom: 12px; }
  .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; font-weight: 600; margin-bottom: 2px; }
  .section-value { font-size: 12px; padding: 4px 0; }
  .section-value.italic { font-style: italic; }
  .section-value.boxed { border: 1px solid #ddd; border-radius: 4px; padding: 6px 10px; min-height: 28px; background: #fafafa; }
  .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 14px; }
  .field-grid.three { grid-template-columns: 1fr 1fr 1fr; }
  .checkbox-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 16px; margin-bottom: 14px; }
  .checkbox-item { display: flex; align-items: center; gap: 6px; font-size: 12px; }
  .checkbox-box { width: 14px; height: 14px; border: 1.5px solid #555; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
  .checkbox-box.checked { background: #166534; border-color: #166534; color: white; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; font-size: 11px; }
  th { background: #f5f5f5; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.3px; }
  .signature-area { margin-top: 40px; display: flex; justify-content: space-between; gap: 40px; }
  .signature-block { text-align: center; flex: 1; }
  .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 4px; font-size: 11px; }
  .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; font-size: 9px; color: #999; }
  .divider { border: none; border-top: 1px solid #eee; margin: 14px 0; }
  .consent-text { font-size: 11px; color: #444; margin: 12px 0; line-height: 1.7; padding: 10px; background: #f9f9f9; border: 1px solid #eee; border-radius: 4px; }
  .exam-card { border: 1px solid #ccc; border-radius: 6px; padding: 12px 14px; margin-bottom: 10px; page-break-inside: avoid; }
  .exam-card-header { font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 8px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
  .exam-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
  .conclusion-box { border: 2px solid #166534; border-radius: 6px; padding: 14px; margin-top: 14px; background: #f0fdf4; }
  .conclusion-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #166534; margin-bottom: 6px; }
  .lab-field { border-bottom: 1px solid #e5e5e5; padding: 8px 0; display: grid; grid-template-columns: 140px 1fr; gap: 8px; align-items: baseline; }
  .lab-field-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; color: #555; }
  .lab-field-value { font-size: 12px; }
  .lab-result-box { border: 1.5px solid #166534; border-radius: 6px; padding: 12px 14px; margin: 10px 0; background: #f0fdf4; min-height: 60px; white-space: pre-wrap; font-size: 12px; line-height: 1.7; }
  .lab-subtitle { font-size: 11px; text-align: center; color: #888; margin-bottom: 16px; letter-spacing: 1px; text-transform: uppercase; }
`;

export const PrintableDocument = ({ doc, onPdfGenerated }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Generate HTML string for the document
  const getHtmlString = () => {
    if (!printRef.current) return '';
    return `<!DOCTYPE html><html><head><title>${doc.title}</title><style>${printStyles}</style></head><body>${printRef.current.innerHTML}</body></html>`;
  };

  // Print from existing PDF or direct HTML
  const handlePrint = () => {
    if (doc.pdf_url) {
      // Open PDF in new tab for printing
      const win = window.open(doc.pdf_url, '_blank');
      if (win) {
        win.addEventListener('load', () => {
          setTimeout(() => { win.print(); }, 500);
        });
      }
    } else {
      // Fall back to HTML print
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(getHtmlString());
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 400);
    }
  };

  // Generate PDF using html2canvas + jsPDF and store it
  const handleGeneratePdf = async () => {
    if (!printRef.current) return;
    setGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Create a temporary visible container for rendering
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '794px'; // A4 width at 96dpi
      container.style.background = 'white';
      container.style.padding = '30px';
      container.style.zIndex = '-1';
      container.innerHTML = `<style>${printStyles}</style>${printRef.current.innerHTML}`;
      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Handle multi-page
      const pageContentHeight = pdfHeight * (imgWidth / pdfWidth);
      let remainingHeight = imgHeight;
      let position = 0;
      let page = 0;

      while (remainingHeight > 0) {
        if (page > 0) pdf.addPage();
        
        const sourceY = position;
        const sourceH = Math.min(pageContentHeight, remainingHeight);
        
        // Create a canvas slice for this page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceH;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, sourceY, imgWidth, sourceH, 0, 0, imgWidth, sourceH);
        }
        
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const pageImgHeight = (sourceH / imgWidth) * pdfWidth;
        pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pageImgHeight);

        remainingHeight -= sourceH;
        position += sourceH;
        page++;
      }

      // Convert to blob
      const pdfBlob = pdf.output('blob');
      const fileName = `doc_${doc.id}_${Date.now()}.pdf`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('pet-attachments')
        .upload(`documents/${fileName}`, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('pet-attachments')
        .getPublicUrl(`documents/${fileName}`);

      const pdfUrl = urlData.publicUrl;

      // Update document with PDF URL
      await supabase.from('visit_documents' as any).update({ pdf_url: pdfUrl }).eq('id', doc.id);

      toast({ title: 'PDF generisan', description: 'PDF je uspješno kreiran i pohranjen.' });
      onPdfGenerated?.(pdfUrl);
    } catch (err) {
      console.error('PDF generation error:', err);
      toast({ title: 'Greška pri generisanju PDF-a', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const fv = doc.field_values || {};

  // Categorize fields
  const ownerFields: [string, any][] = [];
  const ordererFields: [string, any][] = [];
  const petFieldEntries: [string, any][] = [];
  const caseIntroEntries: [string, any][] = [];
  const checkboxFields: [string, boolean][] = [];
  const signatures: [string, string][] = [];
  const repeatingFields: [string, any[]][] = [];
  const textFields: [string, any][] = [];
  let vetVal = '';
  let dateVal = '';

  Object.entries(fv).forEach(([key, val]) => {
    if (key === 'veterinar') vetVal = String(val || '');
    else if (key === 'datum') dateVal = String(val || '');
    else if (signatureKeys.includes(key)) signatures.push([key, String(val || '')]);
    else if (analysisCheckboxKeys.includes(key)) checkboxFields.push([key, !!val]);
    else if (caseIntroKeys.includes(key)) caseIntroEntries.push([key, val]);
    else if (ordererKeys.includes(key)) ordererFields.push([key, val]);
    else if (labAnimalKeys.includes(key)) petFieldEntries.push([key, val]);
    else if (key.startsWith('vlasnik_')) ownerFields.push([key, val]);
    else if (petKeys.includes(key)) petFieldEntries.push([key, val]);
    else if (Array.isArray(val)) repeatingFields.push([key, val]);
    else if (typeof val === 'boolean') checkboxFields.push([key, val]);
    else textFields.push([key, val]);
  });

  const hasCheckboxes = checkboxFields.length > 0;
  const hasMultipleSignatures = signatures.length > 1;
  const isConsent = doc.title?.toLowerCase().includes('saglasnost');
  const isEuthanasia = doc.title?.toLowerCase().includes('eutanazij');
  const isRabies = doc.title?.toLowerCase().includes('bjesnilo');
  const isLabReport = doc.title?.toLowerCase().includes('nalaz') && !doc.title?.toLowerCase().includes('klinič');

  const documentContent = (
    <div ref={printRef}>
      {/* Clinic Header */}
      <div className="header">
        <img src={logoImg} alt="VetHealth" />
        <div className="header-right">
          <div className="clinic-name">{CLINIC.name}</div>
          <div>{CLINIC.address}</div>
          <div>Tel: {CLINIC.phone} | {CLINIC.email}</div>
          <div className="clinic-website">{CLINIC.website}</div>
        </div>
      </div>

      <div className="doc-title">{doc.title}</div>
      {isLabReport && <div className="lab-subtitle">Laboratorijski nalaz</div>}

      {/* Consent intro text */}
      {isConsent && !isEuthanasia && (
        <div className="consent-text">
          Ja, dolje potpisani/a vlasnik životinje, dajem saglasnost za izvođenje
          anestezije i planirane intervencije na mom ljubimcu. Upoznat/a sam sa mogućim
          rizicima koji su povezani sa anestezijom i operativnim zahvatom.
        </div>
      )}
      {isEuthanasia && (
        <div className="consent-text" style={{ borderColor: '#b91c1c', background: '#fef2f2' }}>
          Ja, dolje potpisani/a vlasnik životinje, dajem saglasnost za izvršenje eutanazije
          mog ljubimca. Potvrđujem da sam upoznat/a sa procedurom, da je odluka donesena
          dobrovoljno i da sam imao/la mogućnost konsultacije sa veterinarom o svim
          alternativama. Razumijem da je postupak nepovratan.
        </div>
      )}

      {/* Case intro section */}
      {caseIntroEntries.length > 0 && (
        <>
          <div className="group-title">Podaci o slučaju</div>
          <div className="field-grid three">
            {caseIntroEntries.map(([key, val]) => (
              <div key={key} className="section">
                <div className="section-label">{fieldLabels[key] || key}</div>
                <div className="section-value boxed">{String(val) || '—'}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Orderer section (lab) */}
      {ordererFields.length > 0 && (
        <>
          <div className="group-title">Naručilac</div>
          <div className="field-grid">
            {ordererFields.map(([key, val]) => (
              <div key={key} className="section">
                <div className="section-label">{fieldLabels[key] || key}</div>
                <div className="section-value boxed">{String(val) || '—'}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Owner section */}
      {ownerFields.length > 0 && (
        <>
          <div className="group-title">Podaci o vlasniku</div>
          <div className="field-grid three">
            {ownerFields.map(([key, val]) => (
              <div key={key} className="section">
                <div className="section-label">{fieldLabels[key] || key}</div>
                <div className="section-value boxed">{String(val) || '—'}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pet section */}
      {petFieldEntries.length > 0 && (
        <>
          <div className="group-title">Podaci o životinji</div>
          <div className="field-grid three">
            {petFieldEntries.map(([key, val]) => (
              <div key={key} className="section">
                <div className="section-label">{fieldLabels[key] || key}</div>
                <div className="section-value boxed">{String(val) || '—'}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Analysis checkboxes */}
      {hasCheckboxes && (
        <>
          <div className="group-title">Preporučene analize</div>
          <div className="checkbox-grid">
            {checkboxFields.map(([key, checked]) => (
              <div key={key} className="checkbox-item">
                <div className={`checkbox-box${checked ? ' checked' : ''}`}>
                  {checked ? '✓' : ''}
                </div>
                <span>{fieldLabels[key] || key}</span>
              </div>
            ))}
          </div>
          <hr className="divider" />
        </>
      )}

      {/* Text fields */}
      {textFields.filter(([k]) => !isRabies || (k !== 'zakljucak' && k !== 'vakcinacija_napomena')).map(([key, val]) => {
        if (isLabReport && key === 'rezultat') {
          return (
            <div key={key} className="section">
              <div className="group-title">Rezultat</div>
              <div className="lab-result-box">{String(val) || '—'}</div>
            </div>
          );
        }
        if (isLabReport) {
          return (
            <div key={key} className="lab-field">
              <div className="lab-field-label">{fieldLabels[key] || key}</div>
              <div className="lab-field-value">{String(val) || '—'}</div>
            </div>
          );
        }
        return (
          <div key={key} className="section">
            <div className="section-label">{fieldLabels[key] || key}</div>
            <div className={`section-value${key === 'dijagnoza' ? ' italic' : ''} boxed`}>
              {String(val) || '—'}
            </div>
          </div>
        );
      })}

      {/* Repeating sections */}
      {repeatingFields.map(([key, rows]) => {
        const isExamSection = key === 'pregledi' && isRabies;
        if (isExamSection && rows.length > 0) {
          const examLabels = ['I pregled', 'II pregled', 'III pregled'];
          return (
            <div key={key} className="section">
              <div className="group-title">Pregledi</div>
              {rows.map((row, i) => (
                <div key={i} className="exam-card">
                  <div className="exam-card-header">{examLabels[i] || `Pregled ${i + 1}`}</div>
                  <div className="exam-row">
                    {Object.entries(row).map(([col, v]) => (
                      <div key={col} className="section">
                        <div className="section-label">{repeatingFieldLabels[col] || col}</div>
                        <div className={`section-value${col === 'dijagnoza' ? ' italic' : ''} boxed`}>
                          {String(v) || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        return (
          <div key={key} className="section">
            <div className="group-title">{fieldLabels[key] || key}</div>
            {rows.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}>#</th>
                    {Object.keys(rows[0]).map((col) => (
                      <th key={col}>{repeatingFieldLabels[col] || fieldLabels[col] || col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      {Object.values(row).map((v, j) => (
                        <td key={j}>{String(v) || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      {/* Rabies conclusion + vaccination note */}
      {isRabies && (
        <>
          {textFields.filter(([k]) => k === 'zakljucak').map(([key, val]) => (
            <div key={key} className="conclusion-box">
              <div className="conclusion-title">Završni zaključak</div>
              <div className="section-value">{String(val) || '—'}</div>
            </div>
          ))}
          {textFields.filter(([k]) => k === 'vakcinacija_napomena').map(([key, val]) => val ? (
            <div key={key} className="section" style={{ marginTop: '10px' }}>
              <div className="section-label">Napomena o vakcinaciji</div>
              <div className="section-value boxed">{String(val)}</div>
            </div>
          ) : null)}
        </>
      )}

      {/* Content / notes */}
      {doc.content && (
        <div className="section">
          <div className="section-label">Dodatne napomene</div>
          <div className="section-value boxed">{doc.content}</div>
        </div>
      )}

      {/* Date + Vet */}
      <div className="field-grid" style={{ marginTop: '16px' }}>
        {dateVal && (
          <div className="section">
            <div className="section-label">Datum</div>
            <div className="section-value">{dateVal}</div>
          </div>
        )}
        {vetVal && (
          <div className="section">
            <div className="section-label">Veterinar</div>
            <div className="section-value">{vetVal}</div>
          </div>
        )}
      </div>

      {/* Signatures */}
      <div className="signature-area">
        {hasMultipleSignatures ? (
          signatures.map(([key, val]) => (
            <div key={key} className="signature-block">
              <div className="signature-line">
                {val || (fieldLabels[key] || key)}
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="signature-block">
              <div className="signature-line">Datum: {dateVal || format(new Date(), 'dd.MM.yyyy')}</div>
            </div>
            <div className="signature-block">
              <div className="signature-line">
                {signatures[0]?.[1] || vetVal || 'Potpis veterinara'}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="footer">
        Dokument generisan: {format(new Date(), 'dd.MM.yyyy HH:mm')} | {CLINIC.name} | {CLINIC.website}
      </div>
    </div>
  );

  return (
    <>
      {/* Action buttons */}
      <div className="flex gap-1.5 print:hidden">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewOpen(true)}>
          <Eye className="h-3.5 w-3.5" />Pregled
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleGeneratePdf}
          disabled={generating}
        >
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
          {generating ? 'Generisanje...' : 'Generiši PDF'}
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
          <Printer className="h-3.5 w-3.5" />Štampaj
        </Button>
      </div>

      {/* Hidden content for PDF generation */}
      <div className="hidden">{documentContent}</div>

      {/* PDF badge */}
      {doc.pdf_url && (
        <a
          href={doc.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
        >
          <FileDown className="h-3 w-3" />PDF dostupan
        </a>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Pregled dokumenta: {doc.title}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white rounded-lg border border-border p-8 shadow-inner">
            <style>{printStyles}</style>
            {/* Render content inline for preview */}
            <div>
              {/* Clinic Header */}
              <div className="header">
                <img src={logoImg} alt="VetHealth" style={{ height: '48px' }} />
                <div className="header-right">
                  <div className="clinic-name">{CLINIC.name}</div>
                  <div>{CLINIC.address}</div>
                  <div>Tel: {CLINIC.phone} | {CLINIC.email}</div>
                  <div className="clinic-website">{CLINIC.website}</div>
                </div>
              </div>
              <div className="doc-title">{doc.title}</div>
              {isLabReport && <div className="lab-subtitle">Laboratorijski nalaz</div>}

              {isConsent && !isEuthanasia && (
                <div className="consent-text">
                  Ja, dolje potpisani/a vlasnik životinje, dajem saglasnost za izvođenje
                  anestezije i planirane intervencije na mom ljubimcu.
                </div>
              )}
              {isEuthanasia && (
                <div className="consent-text" style={{ borderColor: '#b91c1c', background: '#fef2f2' }}>
                  Ja, dolje potpisani/a vlasnik životinje, dajem saglasnost za izvršenje eutanazije
                  mog ljubimca. Potvrđujem da sam upoznat/a sa procedurom.
                </div>
              )}

              {caseIntroEntries.length > 0 && (
                <>
                  <div className="group-title">Podaci o slučaju</div>
                  <div className="field-grid three">
                    {caseIntroEntries.map(([key, val]) => (
                      <div key={key} className="section">
                        <div className="section-label">{fieldLabels[key] || key}</div>
                        <div className="section-value boxed">{String(val) || '—'}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {ordererFields.length > 0 && (
                <>
                  <div className="group-title">Naručilac</div>
                  <div className="field-grid">
                    {ordererFields.map(([key, val]) => (
                      <div key={key} className="section">
                        <div className="section-label">{fieldLabels[key] || key}</div>
                        <div className="section-value boxed">{String(val) || '—'}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {ownerFields.length > 0 && (
                <>
                  <div className="group-title">Podaci o vlasniku</div>
                  <div className="field-grid three">
                    {ownerFields.map(([key, val]) => (
                      <div key={key} className="section">
                        <div className="section-label">{fieldLabels[key] || key}</div>
                        <div className="section-value boxed">{String(val) || '—'}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {petFieldEntries.length > 0 && (
                <>
                  <div className="group-title">Podaci o životinji</div>
                  <div className="field-grid three">
                    {petFieldEntries.map(([key, val]) => (
                      <div key={key} className="section">
                        <div className="section-label">{fieldLabels[key] || key}</div>
                        <div className="section-value boxed">{String(val) || '—'}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {hasCheckboxes && (
                <>
                  <div className="group-title">Preporučene analize</div>
                  <div className="checkbox-grid">
                    {checkboxFields.map(([key, checked]) => (
                      <div key={key} className="checkbox-item">
                        <div className={`checkbox-box${checked ? ' checked' : ''}`}>{checked ? '✓' : ''}</div>
                        <span>{fieldLabels[key] || key}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {textFields.filter(([k]) => !isRabies || (k !== 'zakljucak' && k !== 'vakcinacija_napomena')).map(([key, val]) => {
                if (isLabReport && key === 'rezultat') {
                  return (
                    <div key={key} className="section">
                      <div className="group-title">Rezultat</div>
                      <div className="lab-result-box">{String(val) || '—'}</div>
                    </div>
                  );
                }
                if (isLabReport) {
                  return (
                    <div key={key} className="lab-field">
                      <div className="lab-field-label">{fieldLabels[key] || key}</div>
                      <div className="lab-field-value">{String(val) || '—'}</div>
                    </div>
                  );
                }
                return (
                  <div key={key} className="section">
                    <div className="section-label">{fieldLabels[key] || key}</div>
                    <div className={`section-value${key === 'dijagnoza' ? ' italic' : ''} boxed`}>{String(val) || '—'}</div>
                  </div>
                );
              })}

              {repeatingFields.map(([key, rows]) => {
                const isExamSection = key === 'pregledi' && isRabies;
                if (isExamSection && rows.length > 0) {
                  const examLabels = ['I pregled', 'II pregled', 'III pregled'];
                  return (
                    <div key={key} className="section">
                      <div className="group-title">Pregledi</div>
                      {rows.map((row, i) => (
                        <div key={i} className="exam-card">
                          <div className="exam-card-header">{examLabels[i] || `Pregled ${i + 1}`}</div>
                          <div className="exam-row">
                            {Object.entries(row).map(([col, v]) => (
                              <div key={col} className="section">
                                <div className="section-label">{repeatingFieldLabels[col] || col}</div>
                                <div className={`section-value${col === 'dijagnoza' ? ' italic' : ''} boxed`}>{String(v) || '—'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div key={key} className="section">
                    <div className="group-title">{fieldLabels[key] || key}</div>
                    {rows.length > 0 && (
                      <table>
                        <thead><tr><th style={{ width: '30px' }}>#</th>{Object.keys(rows[0]).map((col) => <th key={col}>{repeatingFieldLabels[col] || col}</th>)}</tr></thead>
                        <tbody>{rows.map((row, i) => <tr key={i}><td>{i + 1}</td>{Object.values(row).map((v, j) => <td key={j}>{String(v) || '—'}</td>)}</tr>)}</tbody>
                      </table>
                    )}
                  </div>
                );
              })}

              {isRabies && (
                <>
                  {textFields.filter(([k]) => k === 'zakljucak').map(([key, val]) => (
                    <div key={key} className="conclusion-box">
                      <div className="conclusion-title">Završni zaključak</div>
                      <div className="section-value">{String(val) || '—'}</div>
                    </div>
                  ))}
                  {textFields.filter(([k]) => k === 'vakcinacija_napomena').map(([key, val]) => val ? (
                    <div key={key} className="section" style={{ marginTop: '10px' }}>
                      <div className="section-label">Napomena o vakcinaciji</div>
                      <div className="section-value boxed">{String(val)}</div>
                    </div>
                  ) : null)}
                </>
              )}

              {doc.content && (
                <div className="section">
                  <div className="section-label">Dodatne napomene</div>
                  <div className="section-value boxed">{doc.content}</div>
                </div>
              )}

              <div className="field-grid" style={{ marginTop: '16px' }}>
                {dateVal && <div className="section"><div className="section-label">Datum</div><div className="section-value">{dateVal}</div></div>}
                {vetVal && <div className="section"><div className="section-label">Veterinar</div><div className="section-value">{vetVal}</div></div>}
              </div>

              <div className="signature-area">
                {hasMultipleSignatures ? signatures.map(([key, val]) => (
                  <div key={key} className="signature-block"><div className="signature-line">{val || fieldLabels[key] || key}</div></div>
                )) : (
                  <>
                    <div className="signature-block"><div className="signature-line">Datum: {dateVal || format(new Date(), 'dd.MM.yyyy')}</div></div>
                    <div className="signature-block"><div className="signature-line">{signatures[0]?.[1] || vetVal || 'Potpis veterinara'}</div></div>
                  </>
                )}
              </div>

              <div className="footer">
                Dokument generisan: {format(new Date(), 'dd.MM.yyyy HH:mm')} | {CLINIC.name} | {CLINIC.website}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleGeneratePdf} disabled={generating}>
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
              {generating ? 'Generisanje...' : 'Generiši PDF'}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" />Štampaj
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
