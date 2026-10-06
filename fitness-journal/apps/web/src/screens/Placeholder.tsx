export default function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-mu">{note}</p>
    </div>
  );
}
