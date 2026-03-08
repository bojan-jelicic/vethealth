import { useRef } from 'react';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VisitDocument } from '@/services/visitDetailServices';
import logoImg from '@/assets/vethealth-logo.png';

interface Props {
  doc: VisitDocument;
  petName?: string;
  ownerName?: string;
}

// Field label mapping for nicer display
const fieldLabels: Record<string, string> = {
  vlasnik_ime: 'Ime i prezime vlasnika',
  vlasnik_adresa: 'Adresa',
  vlasnik_telefon: 'Telefon',
  vrsta: 'Vrsta životinje',
  pasmina: 'Pasmina',
  spol: 'Spol',
  starost: 'Starost',
  dijagnoza: 'Dijagnoza',
  anamneza: 'Anamneza',
  klinicka_slika: 'Klinička slika',
  terapija: 'Terapija / Th',
  napomena: 'Napomena',
  veterinar: 'Veterinar',
  datum: 'Datum',
  potpis: 'Potpis',
};

const repeatingFieldLabels: Record<string, string> = {
  lijek: 'Naziv lijeka',
  doziranje: 'Doziranje',
  nacin_primjene: 'Način primjene',
  trajanje: 'Trajanje',
  opis: 'Opis',
  kolicina: 'Količina',
  cijena: 'Cijena (KM)',
};

export const PrintableDocument = ({ doc, petName, ownerName }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${doc.title}</title>
        <style>
          @page { margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.5; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #166534; padding-bottom: 12px; margin-bottom: 20px; }
          .header img { height: 48px; }
          .header-right { text-align: right; font-size: 11px; color: #555; }
          .header-right .clinic-name { font-size: 14px; font-weight: 700; color: #166534; }
          .doc-title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; color: #166534; }
          .section { margin-bottom: 14px; }
          .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; font-weight: 600; margin-bottom: 2px; }
          .section-value { font-size: 12px; padding: 4px 0; }
          .section-value.italic { font-style: italic; }
          .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 16px; }
          .field-grid.three { grid-template-columns: 1fr 1fr 1fr; }
          table { width: 100%; border-collapse: collapse; margin: 8px 0; }
          th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; font-size: 11px; }
          th { background: #f5f5f5; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.3px; }
          .signature-area { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-block { text-align: center; width: 200px; }
          .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 4px; font-size: 11px; }
          .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; font-size: 9px; color: #999; }
          .divider { border: none; border-top: 1px solid #eee; margin: 12px 0; }
        </style>
      </head>
      <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const fv = doc.field_values || {};
  const isRecept = doc.title?.toLowerCase().includes('recept');

  // Separate scalar fields, repeating fields, signature, date, vet
  const scalarFields: [string, any][] = [];
  const repeatingFields: [string, any[]][] = [];
  let signatureVal = '';
  let vetVal = '';
  let dateVal = '';

  Object.entries(fv).forEach(([key, val]) => {
    if (key === 'potpis') signatureVal = String(val || '');
    else if (key === 'veterinar') vetVal = String(val || '');
    else if (key === 'datum') dateVal = String(val || '');
    else if (Array.isArray(val)) repeatingFields.push([key, val]);
    else scalarFields.push([key, val]);
  });

  // Group owner & pet fields for recept
  const ownerFields = scalarFields.filter(([k]) => k.startsWith('vlasnik_'));
  const petFields = scalarFields.filter(([k]) => ['vrsta', 'pasmina', 'spol', 'starost'].includes(k));
  const otherFields = scalarFields.filter(([k]) =>
    !k.startsWith('vlasnik_') && !['vrsta', 'pasmina', 'spol', 'starost'].includes(k)
  );

  return (
    <div>
      <Button variant="outline" size="sm" className="gap-1.5 print:hidden" onClick={handlePrint}>
        <Printer className="h-3.5 w-3.5" />Štampaj
      </Button>

      {/* Hidden printable content */}
      <div ref={printRef} className="hidden">
        {/* Clinic Header */}
        <div className="header">
          <img src={logoImg} alt="VetHealth" />
          <div className="header-right">
            <div className="clinic-name">VetHealth Veterinarska ambulanta</div>
            <div>Ulica veterinara 15, 71000 Sarajevo</div>
            <div>Tel: +387 33 123 456 | info@vethealth.ba</div>
          </div>
        </div>

        {/* Document Title */}
        <div className="doc-title">{doc.title}</div>

        {/* Owner section (for recept) */}
        {ownerFields.length > 0 && (
          <>
            <div className="section-label" style={{ marginBottom: '6px' }}>Podaci o vlasniku</div>
            <div className="field-grid three">
              {ownerFields.map(([key, val]) => (
                <div key={key} className="section">
                  <div className="section-label">{fieldLabels[key] || key}</div>
                  <div className="section-value">{String(val) || '—'}</div>
                </div>
              ))}
            </div>
            <hr className="divider" />
          </>
        )}

        {/* Pet section */}
        {petFields.length > 0 && (
          <>
            <div className="section-label" style={{ marginBottom: '6px' }}>Podaci o životinji</div>
            <div className="field-grid">
              {petFields.map(([key, val]) => (
                <div key={key} className="section">
                  <div className="section-label">{fieldLabels[key] || key}</div>
                  <div className="section-value">{String(val) || '—'}</div>
                </div>
              ))}
            </div>
            <hr className="divider" />
          </>
        )}

        {/* Other fields */}
        {otherFields.map(([key, val]) => (
          <div key={key} className="section">
            <div className="section-label">{fieldLabels[key] || key}</div>
            <div className={`section-value${key === 'dijagnoza' ? ' italic' : ''}`}>
              {typeof val === 'boolean' ? (val ? 'Da' : 'Ne') : (String(val) || '—')}
            </div>
          </div>
        ))}

        {/* Repeating sections as tables */}
        {repeatingFields.map(([key, rows]) => (
          <div key={key} className="section">
            <div className="section-label">{fieldLabels[key] || key}</div>
            {rows.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    {Object.keys(rows[0]).map((col) => (
                      <th key={col}>{repeatingFieldLabels[col] || col}</th>
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
        ))}

        {/* Date */}
        {dateVal && (
          <div className="section" style={{ marginTop: '16px' }}>
            <div className="section-label">Datum</div>
            <div className="section-value">{dateVal}</div>
          </div>
        )}

        {/* Content / notes */}
        {doc.content && (
          <div className="section">
            <div className="section-label">Napomene</div>
            <div className="section-value">{doc.content}</div>
          </div>
        )}

        {/* Signature */}
        <div className="signature-area">
          <div className="signature-block">
            <div className="signature-line">Datum: {dateVal || format(new Date(), 'dd.MM.yyyy')}</div>
          </div>
          <div className="signature-block">
            <div className="signature-line">
              {signatureVal || vetVal || 'Potpis veterinara'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          Dokument generisan: {format(new Date(), 'dd.MM.yyyy HH:mm')} | VetHealth Veterinarska ambulanta
        </div>
      </div>
    </div>
  );
};
