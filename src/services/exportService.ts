import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { Client, Pet, Visit } from './types';

// ─── Audit Log Helper ────────────────────────
async function logExport(action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert([{
      actor_user_id: user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata as any,
    }]);
  } catch (e) {
    console.error('Failed to log export:', e);
  }
}

// ─── Client PDF Export ───────────────────────
export async function exportClientPdf(
  client: Client,
  pets: Pet[],
  visits: Visit[],
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addLine = (text: string, fontSize = 10, bold = false) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(text, 14, y);
    y += fontSize * 0.5 + 2;
  };

  const addSeparator = () => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setDrawColor(200);
    doc.line(14, y, pageWidth - 14, y);
    y += 4;
  };

  // Header
  doc.setFillColor(0, 128, 128);
  doc.rect(0, 0, pageWidth, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VetHealth.ba — Dosje klijenta', 14, 10);
  doc.setTextColor(0, 0, 0);
  y = 24;

  // Date
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`Generirano: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, pageWidth - 14, 10, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // ─ Owner Info ─
  addLine('VLASNIK', 13, true);
  y += 2;
  addLine(`Ime: ${client.name}`);
  if (client.phone) addLine(`Telefon: ${client.phone}`);
  if (client.email) addLine(`Email: ${client.email}`);
  if (client.address) addLine(`Adresa: ${client.address}`);
  if (client.notes) addLine(`Napomene: ${client.notes}`);
  y += 4;
  addSeparator();

  // ─ Pets ─
  addLine(`LJUBIMCI (${pets.length})`, 13, true);
  y += 2;
  if (pets.length === 0) {
    addLine('Nema registrovanih ljubimaca.');
  } else {
    pets.forEach((pet) => {
      addLine(`• ${pet.name}`, 10, true);
      const details = [
        `Vrsta: ${pet.species}`,
        pet.breed ? `Rasa: ${pet.breed}` : null,
        pet.sex ? `Spol: ${pet.sex === 'M' ? 'Mužjak' : pet.sex === 'F' ? 'Ženka' : 'Nepoznat'}` : null,
        pet.birth_date ? `Rođen: ${format(new Date(pet.birth_date), 'dd.MM.yyyy')}` : null,
        pet.weight ? `Težina: ${pet.weight} kg` : null,
        pet.microchip_id ? `Mikročip: ${pet.microchip_id}` : null,
      ].filter(Boolean).join(' | ');
      addLine(`  ${details}`, 9);
      if (pet.allergies) addLine(`  Alergije: ${pet.allergies}`, 9);
      if (pet.chronic_conditions) addLine(`  Hronična stanja: ${pet.chronic_conditions}`, 9);
      y += 2;
    });
  }
  y += 2;
  addSeparator();

  // ─ Last 10 Visits ─
  const recentVisits = visits.slice(0, 10);
  addLine(`POSJETE (zadnjih ${recentVisits.length} od ${visits.length})`, 13, true);
  y += 2;
  if (recentVisits.length === 0) {
    addLine('Nema posjeta.');
  } else {
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(14, y - 3, pageWidth - 28, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Datum', 16, y + 2);
    doc.text('Ljubimac', 52, y + 2);
    doc.text('Razlog', 90, y + 2);
    doc.text('Status', 160, y + 2);
    y += 10;

    const statusLabels: Record<string, string> = {
      scheduled: 'Zakazana', in_progress: 'U toku', completed: 'Završena', cancelled: 'Otkazana',
    };

    doc.setFont('helvetica', 'normal');
    recentVisits.forEach((visit) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(8);
      doc.text(format(new Date(visit.date_time), 'dd.MM.yyyy HH:mm'), 16, y);
      doc.text((visit.pet as any)?.name || '—', 52, y);
      const reason = visit.reason || '—';
      doc.text(reason.length > 40 ? reason.slice(0, 40) + '...' : reason, 90, y);
      doc.text(statusLabels[visit.status] || visit.status, 160, y);
      y += 6;
    });
  }

  // Footer
  y += 6;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Ovaj dokument je generisan iz VetHealth.ba sistema. Povjerljivo.', 14, y);

  // Save
  const fileName = `klijent_${client.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);

  // Log to audit
  await logExport('client_pdf_export', 'client', client.id, {
    client_name: client.name,
    pets_count: pets.length,
    visits_count: recentVisits.length,
  });

  return fileName;
}

// ─── Visits CSV Export ───────────────────────
export async function exportVisitsCsv(
  visits: Visit[],
  dateFrom?: Date,
  dateTo?: Date,
) {
  const statusLabels: Record<string, string> = {
    scheduled: 'Zakazana', in_progress: 'U toku', completed: 'Završena', cancelled: 'Otkazana',
  };

  const headers = ['Datum', 'Ljubimac', 'Vlasnik', 'Razlog', 'Status', 'Napomene'];
  const rows = visits.map((v) => [
    format(new Date(v.date_time), 'dd.MM.yyyy HH:mm'),
    (v.pet as any)?.name || '',
    (v.owner as any)?.name || '',
    (v.reason || '').replace(/"/g, '""'),
    statusLabels[v.status] || v.status,
    (v.notes || '').replace(/"/g, '""'),
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';')),
  ].join('\n');

  // BOM for UTF-8 Excel compatibility
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const rangeLabel = [
    dateFrom ? format(dateFrom, 'yyyyMMdd') : '',
    dateTo ? format(dateTo, 'yyyyMMdd') : '',
  ].filter(Boolean).join('-');
  const fileName = `posjete_${rangeLabel || 'sve'}_${format(new Date(), 'yyyyMMdd')}.csv`;

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Log to audit
  await logExport('visits_csv_export', 'visit', null, {
    visits_count: visits.length,
    date_from: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : null,
    date_to: dateTo ? format(dateTo, 'yyyy-MM-dd') : null,
  });

  return fileName;
}
