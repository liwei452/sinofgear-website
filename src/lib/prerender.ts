export function prepareRootElement(rootElement: HTMLElement) {
  if (!rootElement.hasAttribute('data-prerendered')) return
  rootElement.replaceChildren()
  rootElement.removeAttribute('data-prerendered')
}
