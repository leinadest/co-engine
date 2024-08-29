export default function TimeDivider({ date }: { date: Date }) {
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedDate = formatter.format(date);

  return (
    <div className="flex items-center gap-2">
      <hr className="w-full" />
      <p className="min-w-fit text-sm">{formattedDate}</p>
      <hr className="w-full" />
    </div>
  );
}
