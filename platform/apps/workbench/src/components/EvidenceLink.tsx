export function EvidenceLink(props: { filename: string; locator: string; quote: string }) {
  return (
    <figure className="evidence-card">
      <figcaption>{props.filename} · {props.locator}</figcaption>
      <blockquote>{props.quote}</blockquote>
    </figure>
  )
}
