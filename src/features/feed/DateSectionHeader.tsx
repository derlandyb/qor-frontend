interface DateSectionHeaderProps {
  label: string;
}

export function DateSectionHeader({ label }: DateSectionHeaderProps) {
  return <h3 className="date-section-header">{label}</h3>;
}
