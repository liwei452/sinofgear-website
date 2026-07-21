export function AsyncTaskStatus(props: { status: string; onRetry?: () => void }) {
  return (
    <div className={`async-status status-${props.status.toLowerCase()}`} role="status">
      <span>{props.status}</span>
      {props.onRetry && <button className="table-action" type="button" onClick={props.onRetry}>重试</button>}
    </div>
  )
}
