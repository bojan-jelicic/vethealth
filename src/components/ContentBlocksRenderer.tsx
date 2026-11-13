import type { ServiceContentBlock } from '@/hooks/useAppointmentData';

// "Oznaka: tekst" pasusi dobijaju podebljanu oznaku
const renderLabeled = (para: string) => {
  const m = para.match(/^([^:\n]{3,70}):\s(.+)$/s);
  if (!m) return para;
  return (
    <>
      <strong className="font-semibold text-foreground">{m[1]}:</strong> {m[2]}
    </>
  );
};

export const ContentBlock = ({ block }: { block: ServiceContentBlock }) => {
  if (block.type === 'image') {
    return (
      <figure className="space-y-2">
        <img
          src={block.image_url}
          alt={block.title || ''}
          className="w-full rounded-card shadow-card object-cover max-h-[480px]"
        />
        {block.title && (
          <figcaption className="text-small text-muted-foreground text-center">{block.title}</figcaption>
        )}
      </figure>
    );
  }
  if (block.type === 'list') {
    const items = (block.body || '').split('\n').map((s) => s.trim()).filter(Boolean);
    return (
      <div>
        {block.title && <h2 className="text-h3 text-foreground mb-3">{block.title}</h2>}
        <ul className="space-y-2 pl-6 list-disc marker:text-primary text-muted-foreground text-lg leading-relaxed">
          {items.map((item, i) => (
            <li key={i} className="pl-1">{item}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div>
      {block.title && <h2 className="text-h3 text-foreground mb-3">{block.title}</h2>}
      <div className="space-y-4">
        {(block.body || '')
          .split(/\n\s*\n/)
          .map((para) => para.trim())
          .filter(Boolean)
          .map((para, i) => (
            <p key={i} className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
              {renderLabeled(para)}
            </p>
          ))}
      </div>
    </div>
  );
};

export const ContentBlocksRenderer = ({ blocks }: { blocks: ServiceContentBlock[] }) => (
  <>
    {blocks.map((b) => (
      <ContentBlock key={b.id} block={b} />
    ))}
  </>
);