// One heading treatment for every scenario section. The label is a signpost
// through reference material the candidate scans under time pressure, so it has
// to be findable at a glance without competing with the interviewer's question
// in the next column.
export default function SectionLabel({ children }) {
  if (!children) return null
  return (
    <h3 className="text-[13.5px] font-semibold leading-[1.4] tracking-[-0.005em] text-text-primary">
      {children}
    </h3>
  )
}
